const { google } = require('googleapis'); // Import googleapis correctly
import config from '../service-account';
import axios from 'axios';
import { prisma } from '../utils/prisma';
import { getFmcToken } from '../models/fmcToken.model';
import { PushNotification } from '@prisma/client';
import { updatePushNotification } from '../models/pushNotification.model';

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging']; // Define your scopes

export async function getAccessToken() { // Use async/await for cleaner code
  try {
    const key = config; // Path to your service account key

    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    );

    const tokens = await jwtClient.authorize(); // Use await with authorize

    return tokens.access_token;
  } catch (err) {
    console.error("Error getting access token:", err); // Handle errors properly
    throw err; // Re-throw the error to be handled by the calling function
  }
}


export const sendPushNotification = async (pushNotification: PushNotification) => {
  const { title, body, data } = pushNotification;
  const deviceToken = await getFmcToken(pushNotification.userId)
  if (!deviceToken?.fmcToken || !title || !body) {
    throw new Error('Missing required parameters');
  }

  try {
    const accessToken = await getAccessToken();
    const message = {
      message: {
        token: deviceToken,
        notification: {
          title: title,
          body: body,
        },
        data: data || {},
      },
    };

    const projectId = config.project_id; // Get your project ID
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    const response = await axios.post(url, message, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    await updatePushNotification(pushNotification?.id, {sent: true});
    return {status: "success", message: 'Successfully sent notification', data: response};
  } catch (error: Error | any) {
    throw new Error(`Failed to send notification: ${error}`);
  }
}
