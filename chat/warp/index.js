import {createUuid, system, Message, Data, Service} from "./warp-runtime";

class ChatServer extends Service {
    constructor(name) {
        super(name);
        this._history = [];
    }

    say(userName, text) {
        const chatText = new ChatText(userName, text);
        this._history.push(chatText);
        system.saveData(chatText); // Save data object to datastore
        system.sendMessage(this, new ChatTextSaid(chatText)); // Send SSE to listening clients
    }

    getHistory() {
        return this._history;
    }

    getTime() {
        return new Date();
    }
}

class ChatText extends Data {
    constructor(userName, text) {
        super(createUuid(false));
        this._userName = userName;
        this._text = text;
        this._timestamp = new Date();
    }
    get userName() {
        return this._userName;
    }
    get timestamp() {
        return this._timestamp;
    }
    get text() {
        return this._text;
    }
}

class ChatTextSaid extends Message {
    constructor(chatText) {
        super();
        this._chatText = chatText;
    }
    get chatText() {
        return this._chatText;
    }
}