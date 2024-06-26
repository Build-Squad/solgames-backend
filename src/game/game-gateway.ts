import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway(3004, { cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected === ', client.id);
    client.broadcast.emit('new-users', `User joined the chat - ${client.id}`);
  }
  handleDisconnect(client: Socket) {
    console.log('Client disconnected === ', client.id);
  }
  // Socket.on() let client subscribe to an event, here "connectGame" is an event
  @SubscribeMessage('connectGame')
  handleNewUser(client: Socket, message: any) {
    console.log(message);
    client.emit('reply', 'This is a reply');
    this.server.emit('broadcase', 'Broadcasting');
  }
}
