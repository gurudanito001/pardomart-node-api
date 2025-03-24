/* const cloudinary = require('cloudinary').v2;
import config from "../config/config";



cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
  secure: true,
});


interface props {
  publicId?: string,
  data?: string | null | undefined
}
export const uploadImage = async ({publicId="on8x0w6l", data}: props) => {

  const options = {
    publicId
  };

  try {
    const result = await cloudinary.uploader.upload(data, options);
    return result;
  } catch (error) {
    console.error(error);
  }
};


export const getAssetInfo = async (publicId: string) => {

  const options = {
    colors: true,
  };

  try {
      const result = await cloudinary.api.resource(publicId, options);
      return result.colors;
      } catch (error) {
      console.error(error);
  }
};

 */