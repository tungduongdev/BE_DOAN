// Lưu ý Brevo là tên thương hiệu mới của sib - Sendinblue
// Vì thế trong phần hướng dẫn trên github có thể nó vẫn còn giữ tên biến SibApiV3Sdk
// https://github.com/getbrevo/brevo-node
import SibApiV3Sdk from '@getbrevo/brevo'
import { env } from '../config/environment.js'

/**
 * Có thể xem thêm phần docs cấu hình theo từng ngôn ngữ khác nhau tùy dự án ở Brevo Dashboard > Account > 
 * SMTP & API > API Keys
 * https://brevo.com
 * Với Nodejs thì tốt nhất cứ lên github repo của bọn nó là nhanh nhất:
 * https://github.com/getbrevo/brevo-node
 */

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (toEmail, subject, htmlContent) => {
  //KHỞI TẠO SENDSMTPEMAIL
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

  // tài khoản gửi mail là địa chi email của admin
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }
  // tài khoản nhận mail
  // to là 1 array chúng ta có thể gửi nhiều email cùng 1 lúc
  sendSmtpEmail.to = [{ email: toEmail }]

  // tiêu đề email
  sendSmtpEmail.subject = subject
  // nội dung email
  sendSmtpEmail.htmlContent = htmlContent

  // Gửi mail
  // tra về một promise
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const brevoProvider = {
  sendEmail
}