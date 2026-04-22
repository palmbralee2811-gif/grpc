import grpc from 'k6/net/grpc';
import { check, sleep } from 'k6';

const client = new grpc.Client();
client.load(['.'], 'livevoice.proto');


export const options = {
    stages: [
        { duration: '30s', target: 100 }, 
        { duration: '1m', target: 300 },  
        { duration: '30s', target: 0 },   
    ],
    thresholds: {
        grpc_req_duration: ['p(95)<50'],  
        checks: ['rate==1.0'],           
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
