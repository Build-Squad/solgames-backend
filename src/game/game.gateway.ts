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
    const game = this.gameService.removePlayerFromGameByPlayerId(client.id);
    if (game) {
      this.server.to(game.id).emit('playerDisconnected', {
        message: 'Player disconnected, game ended.',
      });
      this.server.in(game.id).socketsLeave(game.id); // Remove all sockets from the room
      this.gameService.removeGame(game.id); // Cleanup the game from service
    }
  }

  @SubscribeMessage('createGame')
  handleCreateGame(client: Socket, gameCode: string) {
    const { game, error, errorType } = this.gameService.createGame(
      gameCode,
      client.id,
    );
    if (game) {
      // Creating a room when a new game is created with game code
      client.join(gameCode);
      client.emit('gameCreated', {
        id: game.id,
        chess: game.chess.fen(),
        players: game.players,
        turn: game.turn,
        capturedWhitePieces: game.capturedWhitePieces,
        capturedBlackPieces: game.capturedBlackPieces,
      });
    } else {
      client.emit('error', {
        event: 'createGame',
        errorMessage: error,
        errorType,
      });
    }
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(client: Socket, gameCode: string) {
    const { game, error, errorType } = this.gameService.addPlayerToGame(
      gameCode,
      client.id,
    );
    if (game) {
      client.join(gameCode);
      this.server.to(gameCode).emit('playerJoined', {
        id: game.id,
        chess: game.chess.fen(),
        players: game.players,
        turn: game.turn,
        capturedWhitePieces: game.capturedWhitePieces,
        capturedBlackPieces: game.capturedBlackPieces,
      });
    } else {
      client.emit('error', {
        event: 'joinGame',
        errorMessage: error,
        errorType,
      });
    }
  }

  @SubscribeMessage('makeMove')
  handleMakeMove(
    client: Socket,
    { gameId, move }: { gameId: string; move: { from: string; to: string } },
  ) {
    const { valid, game, error, errorType } = this.gameService.makeMove(
      gameId,
      client.id,
      move,
    );
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
      client.emit('error', {
        event: 'makeMove',
        errorMessage: `Invalid Move - ${error}`,
        errorType,
      });
    }
  }
}
