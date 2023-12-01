
def get_day_english(day):
    days_week = {
        'Monday': 'Lunes',
        'Tuesday': 'Martes',
        'Wednesday': 'Miércoles',
        'Thursday': 'Jueves',
        'Friday': 'Viernes',
        'Saturday': 'Sábado', 
        'Sunday': 'Domingo'
    }
    
    return days_week.get(day, day)