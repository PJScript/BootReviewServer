import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';

@WebSocketGateway(8888,{cors:{origin:'http://localhost:3000'}
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  



  @SubscribeMessage('connectChat')
  async openChat(@MessageBody() data: any): Promise<void>{
    let welcomeMsg = `누군가 입장했어요`
    console.log(data)
    await this.server.emit('connectChat',{"id":"system","innerText":welcomeMsg})
  }

  @SubscribeMessage('chat')
  async findAll(@MessageBody() data: any): Promise<void> {
    await this.server.emit('chat',{data})
  }
  
  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
}