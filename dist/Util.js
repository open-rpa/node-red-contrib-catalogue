"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
class Util {
    static EvaluateNodeProperty(RED, node, msg, name, ignoreerrors = false) {
        return new Promise((resolve, reject) => {
            const _name = node.config[name];
            let _type = node.config[name + "type"];
            if (_name == null)
                return resolve(null);
            // if (_type == null) _type = "msg";
            RED.util.evaluateNodeProperty(_name, _type, node, msg, (err, value) => {
                if (err && !ignoreerrors) {
                    reject(err);
                }
                else {
                    resolve(value);
                }
            });
        });
    }
    static SetMessageProperty(RED, msg, name, value) {
        RED.util.setMessageProperty(msg, name, value);
    }
}
exports.Util = Util;
//# sourceMappingURL=Util.js.map