import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createGame')
  handleCreateGame(client: Socket, gameId: string) {
    const game = this.gameService.createGame(gameId);
    client.join(gameId);
    client.emit('gameCreated', {
      id: game.id,
      chess: game.chess.fen(),
      players: game.players,
      turn: game.turn,
      capturedWhitePieces: game.capturedWhitePieces,
      capturedBlackPieces: game.capturedBlackPieces,
    });
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(client: Socket, gameId: string) {
    const game = this.gameService.addPlayerToGame(gameId, client.id);
    if (game) {
      client.join(gameId);
      this.server.to(gameId).emit('playerJoined', {
        id: game.id,
        chess: game.chess.fen(),
        players: game.players,
        turn: game.turn,
        capturedWhitePieces: game.capturedWhitePieces,
        capturedBlackPieces: game.capturedBlackPieces,
      });
    } else {
      client.emit('error', 'Game not found or full');
    }
  }

  @SubscribeMessage('makeMove')
  handleMakeMove(
    client: Socket,
    { gameId, move }: { gameId: string; move: { from: string; to: string } },
  ) {
    const { valid, game, error } = this.gameService.makeMove(gameId, move);
    if (valid && game) {
      this.server.to(gameId).emit('moveMade', {
        id: game.id,
        chess: game.chess.fen(),
        players: game.players,
        turn: game.turn,
        capturedWhitePieces: game.capturedWhitePieces,
        capturedBlackPieces: game.capturedBlackPieces,
      });
    } else {
      client.emit('error', error);
    }
  }
}
