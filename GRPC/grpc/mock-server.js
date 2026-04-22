const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');



const PROTO_PATH = path.join(__dirname, 'livevoice.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const livevoice = protoDescriptor.livevoice;


function translateAudio(call, callback) {
  callback(null, {
    translated_text: "สวัสดี นี่คือข้อความจำลองจาก Server",
    tts_audio: Buffer.from("dummy-audio-bytes")
  });
}


const server = new grpc.Server();
server.addService(livevoice.VoiceService.service, { TranslateAudio: translateAudio });


server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error("เกิดข้อผิดพลาด:", err);
    return;
  }
  server.start();
  console.log("✅ gRPC Mock Server เปิดรอรับสายที่พอร์ต 50051 แล้วครับ!");
});
