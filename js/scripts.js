function sendOtp() {
    const email = document.getElementById('email').value;
    // Add your OTP sending logic here
    function generateOTP(length) {
        // Define all possible characters in OTP (here we are using digits)
        const digits = '0123456789';
        let otp = '';
        
        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * digits.length)];
        }
        
        return otp;
    }
    
    // Example: Generate a 6-digit OTP
    const otp = generateOTP(6);
    console.log("Generated OTP: ", otp);
    
    console.log('OTP sent to:', email);
}

document.getElementById('login-form').onsubmit = function(e) {
    e.preventDefault();
    // Add your OTP verification and redirection logic here
    window.location.href = 'home.html';
};

function logout() {
    // Add your logout logic here
    window.location.href = 'login.html';
};


document.addEventListener('DOMContentLoaded', function() {
    // Initialize FullCalendar
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        editable: true,
        selectable: true,
        events: [],  // Start with an empty event list
        select: function(info) {
            var title = prompt('Enter event title:');
            if (title) {
                calendar.addEvent({
                    title: title,
                    start: info.startStr,
                    end: info.endStr
                });
            }
            calendar.unselect();
        },
        eventClick: function(info) {
            var newTitle = prompt('Enter new title:', info.event.title);
            if (newTitle) {
                info.event.setProp('title', newTitle);
            }
        }
    });

    calendar.render();

    // Function to open the meeting popup
    window.openMeetingPopup = function() {
        document.getElementById('popup-overlay').style.display = 'block';
        document.getElementById('create-meeting-popup').style.display = 'block';
        document.getElementById('error-message').innerText = '';  // Clear previous error messages
    }

    // Function to close the meeting popup
    window.closeMeetingPopup = function() {
        document.getElementById('popup-overlay').style.display = 'none';
        document.getElementById('create-meeting-popup').style.display = 'none';
    }

    // Function to create a meeting
    window.createMeeting = function() {
        const name = document.getElementById('meeting-name').value.trim();
        const type = document.getElementById('meeting-type').value;
        const time = document.getElementById('meeting-time').value;

        const errorMessage = document.getElementById('error-message');
        errorMessage.innerText = '';  // Clear previous error messages

        // Basic validation
        if (!name) {
            errorMessage.innerText = 'Please enter a meeting name.';
            return;
        }
        if (!type) {
            errorMessage.innerText = 'Please select a meeting type.';
            return;
        }
        if (!time) {
            errorMessage.innerText = 'Please select a meeting date and time.';
            return;
        }

        // Validate date/time format
        const meetingDate = new Date(time);
        if (isNaN(meetingDate.getTime())) {
            errorMessage.innerText = 'Invalid date/time format.';
            return;
        }

        // Check if the meeting time is in the future
        const now = new Date();
        if (meetingDate <= now) {
            errorMessage.innerText = 'Meeting time must be in the future.';
            return;
        }

        // Add the meeting to the calendar and list
        const meetingDetails = `${name} (${type})`;
        calendar.addEvent({
            title: meetingDetails,
            start: time,
            allDay: false
        });

        addMeetingToList(meetingDetails, time);

        closeMeetingPopup();
    }

    // Function to add meeting to the list
    function addMeetingToList(name, time) {
        const meetingList = document.getElementById('meeting-list');
        const meetingItem = document.createElement('div');
        meetingItem.className = 'meeting-item';
        meetingItem.innerHTML = `
            <h3>${name}</h3>
            <p>Scheduled for: ${new Date(time).toLocaleString()}</p>
        `;
        meetingList.appendChild(meetingItem);
    }

    // Logout function
    window.logout = function() {
        // Clear any user session data or tokens
        alert('Logging out...');
        // Redirect to login page
        window.location.href = 'login.html';
    }
});

const calendar = document.getElementById('calendar');
const monthYearDisplay = document.getElementById('month-year');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const eventModal = document.getElementById('event-modal');
const selectedDateElement = document.getElementById('selected-date');
const eventNameInput = document.getElementById('event-name');
const eventTimeInput = document.getElementById('event-time');
const eventsList = document.getElementById('events-list');
let selectedDate = null;
let events = JSON.parse(localStorage.getItem('events')) || {};

// Modal functionality
const closeModal = () => {
    eventModal.style.display = 'none';
    eventNameInput.value = '';
    eventTimeInput.value = '';
    selectedDate = null;
};

const openModal = (date) => {
    selectedDate = date;
    selectedDateElement.textContent = `Events for ${date}`;
    eventModal.style.display = 'flex';
    updateEventsList();
};

// Calendar functionality
let currentDate = new Date();

const renderCalendar = () => {
    calendar.innerHTML = '';
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const lastDateOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    monthYearDisplay.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentYear}`;

    // Display empty days for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('date');
        calendar.appendChild(emptyCell);
    }

    // Display days of the month
    for (let i = 1; i <= lastDateOfMonth; i++) {
        const dateCell = document.createElement('div');
        dateCell.classList.add('date');
        dateCell.textContent = i;
        dateCell.addEventListener('click', () => openModal(`${i}/${currentMonth + 1}/${currentYear}`));
        calendar.appendChild(dateCell);
    }
};

const updateEventsList = () => {
    eventsList.innerHTML = '';
    const eventForSelectedDate = events[selectedDate] || [];
    eventForSelectedDate.forEach(event => {
        const eventItem = document.createElement('p');
        eventItem.textContent = `${event.name} at ${event.time}`;
        const googleCalendarLink = generateGoogleCalendarLink(event);
        eventItem.appendChild(googleCalendarLink);
        eventsList.appendChild(eventItem);
    });
};

// Save event
document.getElementById('save-event').addEventListener('click', () => {
    const eventName = eventNameInput.value.trim();
    const eventTime = eventTimeInput.value.trim();

    if (eventName && eventTime && selectedDate) {
        if (!events[selectedDate]) {
            events[selectedDate] = [];
        }
        events[selectedDate].push({ name: eventName, time: eventTime });
        localStorage.setItem('events', JSON.stringify(events));  // Save to localStorage
        closeModal();
        renderCalendar();
    }
});

// Event listeners for changing months
prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Close modal functionality
document.querySelector('.close').addEventListener('click', closeModal);

// Initialize calendar
renderCalendar();

// Generate Google Calendar Link
function generateGoogleCalendarLink(event) {
    const googleCalendarUrl = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(event.name)}&dates=${formatGoogleCalendarDate(selectedDate, event.time)}`;
    const link = document.createElement('a');
    link.href = googleCalendarUrl;
    link.target = "_blank";
    link.textContent = " (Add to Google Calendar)";
    return link;
}

// Format date for Google Calendar
function formatGoogleCalendarDate(dateString, timeString) {
    const dateParts = dateString.split('/');
    const timeParts = timeString.split(':');
    const year = dateParts[2];
    const month = dateParts[1].padStart(2, '0');
    const day = dateParts[0].padStart(2, '0');
    const hours = timeParts[0].padStart(2, '0');
    const minutes = timeParts[1].padStart(2, '0');

    // Google Calendar requires format: YYYYMMDDTHHmmSSZ
    return `${year}${month}${day}T${hours}${minutes}00Z`;
}


