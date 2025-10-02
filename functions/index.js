const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Enable CORS for all origins (for development). Restrict in production.
const corsHandler = cors({ origin: true });

exports.sendNotification = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }

      const { token, notification } = req.body;

      if (!token || !notification) {
        return res.status(400).send('Missing token or notification payload');
      }

      const message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        webpush: {
          fcmOptions: {
            link: '/', // where user goes if they click the notification
          },
        },
      };

      const response = await admin.messaging().send(message);

      console.log('✅ Notification sent successfully:', response);
      return res.status(200).send({ success: true, messageId: response });
    } catch (err) {
      console.error('❌ Error sending notification:', err);
      return res.status(500).send({ success: false, error: err.message });
    }
  });
});
