document.addEventListener('DOMContentLoaded', function() {

  document.querySelector('#compose-form').onsubmit = function() {

    //Declaring email variables
    const recipients = document.querySelector('#compose-recipients').value
    const subject = document.querySelector('#compose-subject').value
    const body = document.querySelector('#compose-body').value

    //Making API request
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
    });
    load_mailbox('sent');
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
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  //Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';


  //Making the API request, clearing out the mailbox and rendering each email
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    //Clears the emails-view div to set it with new data
    document.getElementById('emails-view').innerHTML = ''

    // Show the mailbox name
    var mailbox_name = document.createElement('h3')
    mailbox_name.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    document.getElementById('emails-view').appendChild(mailbox_name)

    //Rendering each email
    emails.forEach(renderEmail)
    })
  
  //Function that handles the rendering of emails
  function renderEmail(email) {
    var div = document.createElement('div');
    div.className = 'border border-secondary'
    div.style = 'margin-top: 0.5rem;'
    div.innerHTML = `<h1>${email.sender}</h1>
    <p>${email.body}`
    document.getElementById('emails-view').appendChild(div)
  }
}

  


