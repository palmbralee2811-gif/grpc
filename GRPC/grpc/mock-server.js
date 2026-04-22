const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');


// 1. ล็อกเป้าหมายไฟล์ .proto ให้อยู่โฟลเดอร์เดียวกันเป๊ะๆ
const PROTO_PATH = path.join(__dirname, 'livevoice.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const livevoice = protoDescriptor.livevoice;

// 2. สร้างฟังก์ชันจำลองการทำงาน
function translateAudio(call, callback) {
  callback(null, {
    translated_text: "สวัสดี นี่คือข้อความจำลองจาก Server",
    tts_audio: Buffer.from("dummy-audio-bytes")
  });
}

// 3. เปิดสวิตช์ Server
const server = new grpc.Server();
server.addService(livevoice.VoiceService.service, { TranslateAudio: translateAudio });

// สั่งให้ Server ไปรอรับสายที่พอร์ต 50051
server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error("เกิดข้อผิดพลาด:", err);
    return;
  }
  server.start();
  console.log("✅ gRPC Mock Server เปิดรอรับสายที่พอร์ต 50051 แล้วครับ!");
});