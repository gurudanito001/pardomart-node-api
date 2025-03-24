/* import { getScheduledPushNotifications } from "./models/pushNotification.model";
import { sendPushNotification } from "./services/pushNotification";


const handleSendNotifications = async () =>{
  try {
    // get list of notifications to be sent
    const pushNotifications = await getScheduledPushNotifications()
    // send a push notification for each of them
    await Promise.all( pushNotifications.map( pushNotification => {
      sendPushNotification(pushNotification)
    }))
  } catch (error) {
    console.log(error)
  }
}

handleSendNotifications() */