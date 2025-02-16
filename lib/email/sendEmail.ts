/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable i18next/no-literal-string */

import nodemailer from 'nodemailer';

import env from '../env';

const transporter = nodemailer.createTransport({
  /*  host: env.smtp.host,
    port: env.smtp.port,
    secure: false,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.password,
    },  */
  host: "email-smtp.us-east-1.amazonaws.com",
  port: 587,
  auth: {
    user: "AKIAWCSVLVFFIQQ5P374",
    pass: "BPpaKyrbXh+QbagQBHe+1UMcfH8za6FBl00m+JnqAPcS"
  }
});

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (data: EmailData) => {
  //if (!env.smtp.host) {
  //  return;
 // }

  const emailDefaults = {
  //  from: env.smtp.from,
  from: 'support@mycentri.com', 
  };
console.log("emailDefaults==>>>",emailDefaults);

  await transporter.sendMail({ ...emailDefaults, ...data });
};
