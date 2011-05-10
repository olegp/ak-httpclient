ak = require('ak');

exports.HttpClient = HttpClient;

// {method, url, headers, body}
// return value is {status:status, headers:{..}, body:[..]}
function HttpClient (settings) {
  if (!(this instanceof HttpClient)) return new HttpClient(settings);
  this.guts = {};
  if (settings) this.setOptions(settings);
};

HttpClient.prototype = {
  
  create : function () {
    this.setOptions({
        "method" : "GET",
        "headers" : {},
        "body" : []
    });
    return this;
  },

  setOptions : function (settings) {
    for (var key in settings)  if (settings.hasOwnProperty(key)) {
        this.setOption(key, settings[key]);
    }
    return this;
  },

  setOption : function (key, val) {
    switch (key) {
      case "headers":
          if (typeof val !== 'object') throw new Error(
              "HttpClient: headers must be a simple object."
          );
          return this.setHeaders(val);
      case "body":
          if (typeof val.forEach !== 'function') throw new Error(
              "HttpClient: body must be iterable."
          );
          // fallthrough
      default:
          this.guts[key] = val;
    }
    return this;
  },

  setHeaders : function (headers) {
    for (var h in headers) if (headers.hasOwnProperty(h)) {
        this.setHeader(h, headers[h]);
    }
    return this;
  },

  setHeader : function (key, val) {
    if (!this.guts.hasOwnProperty("headers")) this.guts.headers = {};
    this.guts.headers[key] = val;
    return this;
  },

  write : function (data) {
    var len = this.guts.headers["Content-Length"] || 0;
    len += data.length;
    this.guts.headers["Content-Length"] = len;
    this.guts.body.push(data);
    return this;
  },

  connect : function (decode) {  
    //if (decode) HttpClient.decode(resp);
    return this;
  },
  
  read : function() {
    // {status:Integer, headers:Objecct, body:Iterable<ByteString>}
    // NOTE only works with http atm
    var response = ak.requestHost(this.guts.url.substr("http://".length), 
        {method: this.guts.method, data: (this.guts.body || []).join('')});
    return {status: response.status, 
            headers: response.headers, 
            body: response.content.toString()};
        
  },
  
  finish : function() {
    return this.connect().read(); 
  }
};

/*
HttpClient.decode = function HttpClient_decode (resp, encoding) {
    encoding = encoding || HashP.get(resp.headers, "Content-Encoding");
    if (!encoding) {
        var contentType = HashP.get(resp.headers, "Content-Type");
        if (contentType) {
            encoding = /charset=([^;\s]+)/.exec(contentType);
            if (encoding) encoding = encoding[1];
        }
    }
    // fall back on UTF-8. It's almost always a good choice.
    if (!encoding) encoding = 'UTF-8';
    var raw = resp.body;
    resp._rawBody = raw;
    resp.body = {forEach : function (block) {
        raw.forEach(function (i) {
            block(i.decodeToString(encoding));
        });
    }};
    return resp;
};

HttpClient.undecode = function HttpClient_undecode (resp) {
    if ("_rawBody" in resp) resp.body = resp._rawBody;
    delete resp._rawBody;
    return resp;
};
*/
