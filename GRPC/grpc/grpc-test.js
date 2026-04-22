import grpc from 'k6/net/grpc';
import { check, sleep } from 'k6';

const client = new grpc.Client();
client.load(['.'], 'livevoice.proto');

// โหมด Load Test: ไต่ระดับความโหดไปถึง 300 คน
export const options = {
    stages: [
        { duration: '30s', target: 100 }, // ช่วงที่ 1: วอร์มอัป ไต่ระดับไป 100 คน ใน 30 วินาที
        { duration: '1m', target: 300 },  // ช่วงที่ 2: เอาจริง! อัดไปที่ 300 คนค้างไว้ 1 นาที
        { duration: '30s', target: 0 },   // ช่วงที่ 3: ค่อยๆ ทยอยปิดแอปออกไป
    ],
    thresholds: {
        grpc_req_duration: ['p(95)<50'],  // กฎ 1: ความหน่วง 95% ต้องเร็วกว่า 50ms
        checks: ['rate==1.0'],            // กฎ 2: การเชื่อมต่อต้องสำเร็จ 100% (ไม่มี Error)
    },
};

export default function () {
    client.connect('127.0.0.1:50051', { plaintext: true });

    const data = { audio_chunk: 'bW9jay1hdWRpby1kYXRh' };
    const response = client.invoke('livevoice.VoiceService/TranslateAudio', data);

    check(response, {
        '✅ gRPC Status is OK': (r) => r && r.status === grpc.StatusOK,
    });

    client.close();
    sleep(1);
}