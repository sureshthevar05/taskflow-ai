import os
import json
import dotenv
dotenv.load_dotenv()

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from groq import Groq
from .models import Task
from .serializers import TaskSerializer
from datetime import datetime

# inside the parse method, before the API call:
now = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
current_day = datetime.now().strftime("%A")

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer

    @action(detail=False, methods=['post'])
    def parse(self, request):
        user_input = request.data.get('text', '')
        now = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        current_day = datetime.now().strftime("%A")

        client = Groq(api_key=os.getenv('GROQ_API_KEY'))

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": f"""You are a task extraction assistant.
                Extract task details from the user's natural language input.
                Return ONLY a JSON object with these fields:
                - title (string, short and clear)
                - description (string, more detail)
                - priority (string, one of: high, medium, low)
                - due_date (string, ISO 8601 format YYYY-MM-DDTHH:MM:SS, or null if no date/time mentioned)
                Rules for due_date:
                - If only a time is mentioned (e.g. "meeting at 8pm"), use today's date with that time.
                - If only a date is mentioned with no time, default time to 09:00:00.
                - If relative terms are used ("tomorrow", "next Monday"), calculate the actual date.
                - Always output 24-hour format for time.
                Today's date and time is {now} ({current_day})."""},
                {"role": "user", "content": user_input}
            ],
            response_format={"type": "json_object"}
        )

        extracted = json.loads(response.choices[0].message.content)
        extracted['is_completed'] = False

        serializer = TaskSerializer(data=extracted)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        tasks = Task.objects.filter(is_completed=False).order_by('due_date')
        
        if not tasks.exists():
            return Response({"summary": "No pending tasks. You're all caught up!"})

        now = datetime.now(tasks.first().due_date.tzinfo) if tasks.first().due_date else datetime.now()

        task_lines = []
        for t in tasks:
            if t.due_date:
                diff = t.due_date - now
                total_minutes = int(diff.total_seconds() // 60)
                if total_minutes < 0:
                    overdue_by = abs(total_minutes)
                    if overdue_by < 60:
                        time_info = f"OVERDUE by {overdue_by} minutes"
                    elif overdue_by < 1440:
                        time_info = f"OVERDUE by {overdue_by // 60} hours"
                    else:
                        time_info = f"OVERDUE by {overdue_by // 1440} days"
                else:
                    if total_minutes < 60:
                        time_info = f"due in {total_minutes} minutes"
                    elif total_minutes < 1440:
                        time_info = f"due in {total_minutes // 60} hours"
                    else:
                        time_info = f"due in {total_minutes // 1440} days"
            else:
                time_info = "no due date set"

            task_lines.append(f"- {t.title} (Priority: {t.priority}, {time_info})")

        task_list = "\n".join(task_lines)

        client = Groq(api_key=os.getenv('GROQ_API_KEY'))

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": """You are a productivity assistant. Given a list of pending tasks with their priority and time status, give a concise and motivating daily focus summary in 3-5 sentences.
                Rules:
                - If any task is OVERDUE, mention it first and urge immediate action.
                - Mention tasks due soon (within a few hours) by name, with urgency.
                - For tasks due later, briefly group them without over-explaining.
                - Keep the tone encouraging but direct, like a sharp personal assistant."""},
                {"role": "user", "content": f"Here are my pending tasks:\n{task_list}"}
            ]
        )

        return Response({"summary": response.choices[0].message.content})