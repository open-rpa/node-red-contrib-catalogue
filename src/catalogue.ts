// var Context = require("@node-red/runtime/lib/nodes/context/index");
const https = require('https');
const http = require('http');
const fs = require("fs");
const path = require("path");
import { Util } from "./Util";

export = function (RED: any) {
    class catalogue_catalogue {
        public node: any = null;
        public name: string = "";
        constructor(public config: any) {
            RED.nodes.createNode(this, config);
            this.node = this;
            this.node.status({});
            this.node.on("input", this.oninput.bind(this));
            this.name = config.name || "catalogue";
        }
        geturl(url: string): Promise<string> {
            return new Promise((resolve, reject) => {

                var _http = https;
                if (url.startsWith("http:")) {
                    _http = http;
                }
                _http.get(url, (resp) => {
                    let data = '';
                    resp.on('data', (chunk) => {
                        data += chunk;
                    });
                    resp.on('end', () => {
                        resolve(data);
                    });
                }).on("error", (err) => {
                    reject(err);
                });
            });
        }
        async oninput(msg: any) {
            try {
                let registryHost = await Util.EvaluateNodeProperty<string>(RED, this, msg, "registry");
                const update: any = await Util.EvaluateNodeProperty<string>(RED, this, msg, "update");
                var Context = this.node._flow.context;
                var catalogue = Context.get("catalogue");
                if(update == true || update == "true") catalogue = null;
                if (catalogue == null) {
                    if (!registryHost.endsWith("/")) registryHost += "/";
                    this.node.status({ fill: "blue", shape: "dot", text: "Fething " + registryHost});
                    catalogue = {
                        "name": "node-red-contrib-catalogue",
                        "updated_at": new Date().toISOString(),
                        "modules": [
                        ]
                    }

                    const nodes = JSON.parse(await this.geturl(registryHost + "-/all"));

                    var nodeNames = Object.keys(nodes);
                    const index = nodeNames.indexOf("_updated");
                    if (index > -1) {
                        nodeNames.splice(index, 1);
                    }

                    for (const node in nodeNames) {
                        var n = nodes[nodeNames[node]];
                        if (n.keywords) {
                            if (n.keywords.indexOf("node-red") != -1) {
                                try {
                                    let details = JSON.parse(await this.geturl(registryHost + nodeNames[node]));
                                    let latest = details['dist-tags'].latest
                                    let version = details.versions[latest]
                                    var entry = {
                                        id: n.name,
                                        version: n["dist-tags"].latest,
                                        description: n.description,
                                        keywords: n.keywords,
                                        updated_at: n.time.modified,
                                        url: registryHost + "-/web/details/" + n.name
                                    }
                                    catalogue.modules.push(entry)
                                } catch (e) {
                                    console.log("err", e)
                                }
                            }
                        }
                    }
                    Context.set("catalogue", catalogue);
                }
                msg.payload = catalogue;
                this.node.send(msg);
                this.node.status({});
            } catch (error) {
                this.node.error(error, msg);
            }

        }
    }
    RED.nodes.registerType("catalogue catalogue", (catalogue_catalogue as any));
}
