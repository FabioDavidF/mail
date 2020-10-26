document.addEventListener('DOMContentLoaded', function() {

  document.querySelector('#compose-form').onsubmit = function() {

    // Declaring email variables
    const recipients = document.querySelector('#compose-recipients').value
    const subject = document.querySelector('#compose-subject').value
    const body = document.querySelector('#compose-body').value

    // Making API request
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
      load_mailbox('sent');
    });

    // Preventing the form to do its natural submit action, which is to load the url again
    return false;
  }
 
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// Function that is triggered when email div is clicked, shows email view
function viewEmail(email_id) {

  // Clearing out other views and showing email view
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';


  // API Request to fetch the email info
  fetch(`/emails/${email_id}`)
  // Turning the response into a javascript object file
  .then(response => response.json())
  // Getting the data into the html elements
  .then(email => {
    document.querySelector('#email-view-sender').innerHTML = `From: ${email.sender}`
    document.querySelector('#email-view-recipients').innerHTML = `To: ${email.recipients}`
    document.querySelector('#email-view-subject').innerHTML = `Subject: ${email.subject}`
    document.querySelector('#email-view-body').innerHTML = `"${email.body}"`
    document.querySelector('#email-view-timestamp').innerHTML = email.timestamp

    // Creating archive or unarchive button
    var archive_button = document.querySelector('#email-view-archive-button')
    if (email.archived) {
      archive_button.innerHTML = 'Unarchive'
      archive_button.onclick = function () {unarchiveEmail(email.id)}
    } else {
      archive_button.innerHTML = 'Archive'
      archive_button.onclick = function () {archiveEmail(email.id)}
    }

    // Linking reply button to reply function via the onclick event listener
    document.querySelector('#email-view-reply-button').onclick = function () {reply(email.id)}

    // Marking the email as read
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
  })
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Making the API request, clearing out the mailbox and rendering each email
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // Clears the emails-view div to set it with new data
    document.getElementById('emails-view').innerHTML = ''

    // Show the mailbox name
    var mailbox_name = document.createElement('h3')
    mailbox_name.style = 'margin: 1rem;'
    mailbox_name.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    document.getElementById('emails-view').appendChild(mailbox_name)

    // Rendering each email
    emails.forEach(renderEmail)
  })
  
  // Function that handles the rendering of emails
  function renderEmail(email) {
    var div = document.createElement('div');

    // Sets the background color to gray if the email is read
    if (email.read == true) {
      div.style = 'margin: 1rem; padding: 0.5rem; background-color: #ebebeb'
    } else {
      div.style = 'margin: 1rem; padding: 0.5rem;'
    }

    div.className = ' email-div border border-secondary rounded'  

    div.innerHTML = `<a class='anchor-${email.id}' href='#' style='text-decoration: none; color: inherit;' onclick= ' viewEmail(${email.id});'>

    <h3>From: ${email.sender}</h3>

    <h5>${email.subject}</h5>

    <p class='timestamp-paragraph' style='margin-left: 93%; margin-bottom:0%; font-size: 0.7rem;'>${email.timestamp}</p>

    </a>`
    
    document.getElementById('emails-view').appendChild(div)    
  }
}

function archiveEmail(email_id) {

  // API Request to fetch the email info
  fetch(`/emails/${email_id}`)

  // Turning the response into a javascript object file
  .then(response => response.json())

  // Archiving email
  .then( () => {
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
    // Loading inbox when fetch is complete
    .then( () => {load_mailbox('inbox');})  
  })
}

function unarchiveEmail(email_id) {

  // API Request to fetch the email info
  fetch(`/emails/${email_id}`)

  // Turning the response into a javascript object file
  .then(response => response.json())

  // Unarchiving email
  .then( () => {

    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })

    // Loading inbox when fetch is complete
    .then( () => {load_mailbox('inbox');})  
  })
}

function reply(email_id) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Fetching email that is being replied to get its info
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    // Altering field values to be a reply
    let recipients = document.querySelector('#compose-recipients')
    let subject = document.querySelector('#compose-subject')
    recipients.value = email.sender;
    recipients.disabled = true;

    // Checking if the email has already been replied via the include of the string Re:
    if (email.subject.includes('Re:')) {
      subject.value = email.subject;
    } else {
      subject.value = `Re: ${email.subject}`;
    }

    subject.disabled = true;
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: "${email.body}"`;
  })
}
 