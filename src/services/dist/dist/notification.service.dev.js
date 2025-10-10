"use strict";

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = void 0 && (void 0).__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

exports.__esModule = true;
exports.getUnreadCount = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = exports.notifyVendorOfNewOrder = exports.createNotification = void 0; // src/services/notification.service.ts

var client_1 = require("@prisma/client");

var notificationModel = require("../models/notification.model");

var deviceModel = require("../models/device.model");

var userModel = require("../models/user.model");

var fcm_util_1 = require("../utils/fcm.util");
/**
 * A generic function to create a notification record and send a push notification.
 */


exports.createNotification = function (args) {
  return __awaiter(void 0, void 0, void 0, function () {
    var userId, title, body, type, meta, notification, devices, tokens;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          userId = args.userId, title = args.title, body = args.body, type = args.type, meta = args.meta;
          return [4
          /*yield*/
          , notificationModel.createNotification({
            userId: userId,
            title: title,
            body: body,
            type: type,
            meta: meta || {}
          })];

        case 1:
          notification = _a.sent();
          return [4
          /*yield*/
          , deviceModel.getDevicesByUserId(userId)];

        case 2:
          devices = _a.sent();

          if (devices.length === 0) {
            console.log("No devices found for user " + userId + " to send push notification.");
            return [2
            /*return*/
            , notification];
          }

          tokens = devices.map(function (d) {
            return d.fcmToken;
          }); // 3. Send push notification via a provider like FCM

          return [4
          /*yield*/
          , fcm_util_1.sendPushNotification({
            tokens: tokens,
            title: title,
            body: body,
            data: __assign({
              notificationId: notification.id
            }, meta)
          })];

        case 3:
          // 3. Send push notification via a provider like FCM
          _a.sent();

          return [2
          /*return*/
          , notification];
      }
    });
  });
};
/**
 * Notifies all relevant users of a vendor (owner and staff) about a new order.
 * This function would be called from the order service.
 * @param vendorId - The ID of the vendor who received the order.
 * @param orderId - The ID of the new order.
 */


exports.notifyVendorOfNewOrder = function (vendorId, orderId) {
  return __awaiter(void 0, void 0, void 0, function () {
    var vendorUsers, title, body, notificationPromises;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , userModel.findMany({
            where: {
              OR: [{
                vendor: {
                  id: vendorId
                },
                role: client_1.Role.vendor
              }, {
                vendorId: vendorId,
                role: client_1.Role.store_shopper
              }]
            },
            select: {
              id: true
            }
          })];

        case 1:
          vendorUsers = _a.sent();
          if (vendorUsers.length === 0) return [2
          /*return*/
          ];
          title = 'New Order Received!';
          body = "A new order has been placed. Tap to view.";
          notificationPromises = vendorUsers.map(function (user) {
            return exports.createNotification({
              userId: user.id,
              title: title,
              body: body,
              type: client_1.NotificationType.NEW_ORDER_PLACED,
              meta: {
                orderId: orderId
              }
            });
          });
          return [4
          /*yield*/
          , Promise.all(notificationPromises)];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
};

exports.getNotifications = function (userId, page, take) {
  return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, totalCount, totalPages;

    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [4
          /*yield*/
          , notificationModel.getNotificationsByUserId(userId, {
            page: page,
            take: take
          })];

        case 1:
          _a = _b.sent(), data = _a.data, totalCount = _a.totalCount;
          totalPages = Math.ceil(totalCount / take);
          return [2
          /*return*/
          , {
            data: data,
            page: page,
            pageSize: take,
            totalCount: totalCount,
            totalPages: totalPages
          }];
      }
    });
  });
};

exports.markAsRead = function (notificationId, userId) {
  return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
      return [2
      /*return*/
      , notificationModel.markNotificationAsRead(notificationId, userId)];
    });
  });
};

exports.markAllAsRead = function (userId) {
  return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
      return [2
      /*return*/
      , notificationModel.markAllNotificationsAsRead(userId)];
    });
  });
};

exports.getUnreadCount = function (userId) {
  return __awaiter(void 0, void 0, Promise, function () {
    var count;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , notificationModel.getUnreadNotificationCount(userId)];

        case 1:
          count = _a.sent();
          return [2
          /*return*/
          , {
            count: count
          }];
      }
    });
  });
};