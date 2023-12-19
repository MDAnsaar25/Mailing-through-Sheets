function generateAndEmailReports() {
  // Replace YOUR_SPREADSHEET_ID with the actual ID of your Google Sheets spreadsheet
  var spreadsheetId = "1328WkfB9Zohk1F2c1fvCgL-ewoakiEbMLCPBjfvdsXk";
  var sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  // Replace YOUR_TEMPLATE_ID with the actual ID of your Google Docs template
  var templateId = "1LybwPqdI3IWY1UOLJc7KFrMVhhJECfxQ-jHrlTcJL0k";
  var templateFile = DriveApp.getFileById(templateId);

  // Define CC emails
  var ccEmails = ["rasheedakesury@brightchamps.com"]; // Add your CC emails here

  // Loop through each row of data
  for (var i = 1; i < data.length; i++) { // Start from 1 to skip headers
    var rowData = data[i];

    // Duplicate the template document
    var copyDoc = DocumentApp.openById(templateFile.makeCopy().getId());
    var copyBody = copyDoc.getBody();

    // Replace placeholders in the copied document
    for (var j = 0; j < headers.length; j++) {
      var placeholder = "{{" + headers[j] + "}}";
      var value = rowData[j];

      // Format date if placeholder contains "Date" and the value is a string
      if (headers[j].toLowerCase().includes("date") && typeof value === 'string') {
        // Extract only the date part from the string (assuming the date is in "YYYY-MM-DD" format)
        value = value.split(" ")[0];
      }

      // Check if the placeholder is for a link
      if (headers[j].toLowerCase().includes("link") && value) {
        // Replace the link placeholder with the actual link value
        copyBody.replaceText(placeholder, value);
      } else {
        // Replace regular placeholders in the copied document
        copyBody.replaceText(placeholder, value);
      }
    }

    // Save and close the copied document
    copyDoc.saveAndClose();

    // Convert the copied document to PDF
    var pdfBlob = DriveApp.getFileById(copyDoc.getId()).getAs("application/pdf");

    // Delete the copied document
    DriveApp.getFileById(copyDoc.getId()).setTrashed(true);

    // Send email with PDF attachment and CC
    var teacherEmail = rowData[headers.indexOf("Teacher_email")]; // Change to the actual column name
    sendEmailWithPdfAttachment(teacherEmail, ccEmails, "Your Custom Report", "Please find your class evaluation report attached.", pdfBlob);
  }
}

// Example function to send an email with a PDF attachment and CC
function sendEmailWithPdfAttachment(teacherEmail, ccEmails, subject, body, attachment) {
  MailApp.sendEmail({
    to: teacherEmail,
    cc: ccEmails.join(), // Convert the array of CC emails to a comma-separated string
    subject: subject,
    body: body,
    attachments: [attachment]
  });
}
