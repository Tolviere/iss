createStudent("Bongo", "going to batroom", "12:32 AM");
createStudent("bopbop", "going to batcave", "3:33 AM");


function createStudent(name, status, departure) {
    const studentContainerElement = document.getElementsByClassName("student-container")[0];
    console.log(studentContainerElement);
    const studentElement = document.createElement('div');
    studentElement.class = "student-container";
    studentContainerElement.appendChild(studentElement);

    const nameElement = document.createElement('h3');
    nameElement.textContent = name;
    studentElement.appendChild(nameElement);

    const statusElement = document.createElement('p');
    statusElement.textContent = `Status: ${status}`;
    studentElement.appendChild(statusElement);
    
    const departureElement = document.createElement('p');
    departureElement.textContent = `Departure ${departure}`;
    studentElement.appendChild(departureElement);
}