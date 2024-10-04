import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly gameService: SocketService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // This is not happening now
    const game = this.gameService.removePlayerFromGameByPlayerId(client.id);
    if (game) {
      this.server.to(game.id).emit('playerDisconnected', {
        message: 'Player disconnected, game ended.',
      });
      this.server.in(game.id).socketsLeave(game.id); // Remove all sockets from the room
      this.gameService.removeGame(game.id); // Cleanup the game from service
    }
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    client: Socket,
    { userId, gameCode }: { userId: string; gameCode: string },
  ) {
    const { game, error, errorType } = await this.gameService.addPlayerToGame(
      gameCode,
      userId,
    );

    if (game) {
      client.join(gameCode);
      this.server.to(gameCode).emit('playerJoined', {
        id: game.id,
        chess: game.chess.fen(),
        players: game.players,
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

  @SubscribeMessage('inactiveUser')
  async handlePlayerInactivity(
    client: Socket,
    { gameId }: { gameId: string; userId: string; inactivityType: string },
  ) {
    const { error, errorType, currentPlayer } =
      await this.gameService.inactivePlayer(gameId);

    this.server.to(gameId).emit('error', {
      event: 'inactivePlayer',
      errorMessage: error,
      errorType,
      currentPlayer,
    });
    return;
  }

  @SubscribeMessage('surrenderCall')
  async handlePlayerSurrender(
    client: Socket,
    { gameId, userId }: { gameId: string; userId: string },
  ) {
    const { error, errorType, currentPlayer } =
      await this.gameService.surrenderCall(gameId, userId);

    this.server.to(gameId).emit('error', {
      event: 'inactivePlayer',
      errorMessage: error,
      errorType,
      currentPlayer,
    });
    return;
  }

  @SubscribeMessage('makeMove')
  async handleMakeMove(
    client: Socket,
    {
      gameId,
      move,
      userId,
    }: { gameId: string; move: { from: string; to: string }; userId: string },
  ) {
    const { valid, game, error, errorType } = await this.gameService.makeMove(
      gameId,
      userId,
      move,
    );
    if (valid && game) {
      this.server.to(gameId).emit('moveMade', {
        id: game.id,
        chess: game.chess.fen(),
        players: game.players,
        capturedWhitePieces: game.capturedWhitePieces,
        capturedBlackPieces: game.capturedBlackPieces,
      });
    } else {
      if (errorType == 'GAME_DRAW' || errorType == 'GAME_OVER') {
        this.server.to(gameId).emit('error', {
          event: 'makeMove',
          errorMessage: error,
          errorType,
        });
        return;
      } else {
        client.emit('error', {
          event: 'makeMove',
          errorMessage: error,
          errorType,
        });
      }
    }
  }
}
