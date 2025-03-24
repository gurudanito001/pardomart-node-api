import jwt from "jsonwebtoken"
import moment from "moment";
import httpStatus from "http-status";
import config from "../config/config";

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */


export function generateToken (data: any) {
  return jwt.sign(data, config.SECRET, {expiresIn: '365d'});
};

export function decodeToken(token: string){
  let data = jwt.verify(token, config.SECRET);
  return data;
}

/**
 * Save a token
 * @param {string} token
 * @param {number} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
/* const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  let tokenDoc = await Token.findOne({ where: { type, userId } });
  if (tokenDoc) {
    await Token.update(
      { token, expires: expires.toDate(), blacklisted },
      {
        where: {
          id: tokenDoc.id,
        },
      }
    );
    Object.assign(tokenDoc, { token, expires: expires.toDate(), blacklisted });
  } else {
    tokenDoc = await Token.create({
      token,
      userId,
      expires: expires.toDate(),
      type,
      blacklisted,
    });
  }

  return tokenDoc;
}; */



/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
/* const verifyToken = async (data: object, type) => {
  const tokenDoc = await Token.findOne({ where: { token: data.token, type, userId: data.userId, blacklisted: false } });
  if (!tokenDoc) {
    throw new Error('Email verification failed');
  }
  return tokenDoc;
}; */

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
/* const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    userToken: {
      accessToken,
      accessTokenExpires: accessTokenExpires.toDate(),
      refreshToken,
      refreshTokenExpires: refreshTokenExpires.toDate(),
    },
  };
}; */

/* const generateActionToken = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
}; */

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
/* const generateResetPasswordToken = async (email: string) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const resetToken = generateRandomString(4, true);
  const resetTokenExpires = moment().add(config.JWT_RESET_PASSWORD_EXPIRATION_MINUTES, 'minutes');
  const token = await saveToken(resetToken, user.id, resetTokenExpires, tokenTypes.RESET_PASSWORD);

  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  return token;
}; */


