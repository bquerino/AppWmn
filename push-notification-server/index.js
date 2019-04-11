const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Device = new Schema({
    deviceId : String,
    platform : String
});

const DeviceSchema = mongoose.model('Device', Device);

//npm install restify --save
const restify = require('restify');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function(){
    console.log('db open');
});

//Instância da base
mongoose.connect('mongodb://localhost/pushserver');

//Criando o servidor
const server = restify.createServer({
    name : 'pushServer'
});

//Alterar a porta do host e printar onde está os endpoints
server.listen(8181, function(){
    console.log('%s listening at %s', server.name, server.url)
})

server.use(restify.plugins.bodyParser());

server.post('/register', (req, res, next) => {
    let body = JSON.stringify(req.body);

    if (body) {
        let newDevice = new DeviceSchema(body);
        newDevice.save(err => {
            if (!err) {
                res.send(200);
            } else {
                res.send(500);
            }
        }
        )}
})

server.get('/send', (req, res) => {
    DeviceSchema.find( (err, devices) => {
        if (!err && devices) {
            let androidDevices = [];
            devices.forEach(device => {
                if (device.platform === 'ios') {
                    sendIos(device.deviceId);
                } else if (device.platform === 'android') {
                    androidDevices.push(device.deviceId);
                }
            });
            sendAndroid(androidDevices);
            res.send(200);
        } else {
            res.send(500);
        }
    });
});

//npm install apns --save
const apns = require('apns');

const options = {
    keyFile  : 'key.pem',
    certFile : 'cert.pem',
    debug    : true,
    gateway  : 'gateway.sandbox.push.apple.com',
    errorCallback : function(num, err) {
        console.error(err);
    }
};

function sendIos(deviceId) {
    let connection = new apns.Connection(options);

    let notification = new apns.Notification();
    notification.device = new apns.Device(deviceId);
    notification.alert = 'Hello World !';

    connection.sendNotification(notification);
}

//npm install node-gcm --save

const gcm = require('node-gcm');

function sendAndroid(devices) {
    let message = new gcm.Message({
        notification : {
            title : 'Hello, World!',
            playsound: true,
            soundName: 'default'
        }
    });
    
    //Chave é só criar a aplicaçao https://developers.google.com/mobile/add?platform=android e pegar o senderId(pro nosso app) e o Server API Key(server side)
    let sender = new gcm.sender('INSERIR A CHAVE AQUI');
    //senderId = PEGAR O SENDERID NO SITE DA GOOGLE

    sender.send(message, {
        registrationTokens : devices
    }, function(err, response) {
        if (err) {
            console.error(err);
        } else {
            console.log(response);
        }
    });
}