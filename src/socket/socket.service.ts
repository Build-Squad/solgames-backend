import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chess } from 'chess.js';
import { Games, GameStatus } from 'src/games/entities/game.entity';
import { Repository } from 'typeorm';

interface WebSocketGameStruct {
  id: string;
  chess: Chess;
  players: {
    id: string;
    color: 'w' | 'b';
  }[];
  capturedWhitePieces: string[];
  capturedBlackPieces: string[];
  winner?: 'w' | 'b';
  gameOver?: boolean;
}
@Injectable()
export class SocketService {
  private games: Map<string, WebSocketGameStruct> = new Map();
  constructor(
    @InjectRepository(Games) private gameRepository: Repository<Games>,
  ) {}

  createGame(gameCode: string, userId: string) {
    const chess = new Chess();
    const game: WebSocketGameStruct = {
      id: gameCode,
      chess,
      players: [{ id: userId, color: 'w' }],
      capturedWhitePieces: [],
      capturedBlackPieces: [],
    };

    this.games.set(gameCode, game);
    return { game };
  }

  async addPlayerToGame(gameCode: string, userId: string) {
    let error = '';
    let errorType = '';

    // Game from database based on invite code
    const inviteGameDetails = await this.gameRepository.findOne({
      where: { inviteCode: gameCode },
    });

    // Check if the game exists and if the user is authorized to join
    if (!inviteGameDetails) {
      error = 'Game not found, please enter a valid invite code!';
      errorType = 'GAME_NOT_FOUND';
      return { game: undefined, error, errorType };
    }

    if (
      !(
        inviteGameDetails.acceptorId === userId ||
        inviteGameDetails.creatorId === userId
      )
    ) {
      error = 'You are not authorized to join this game.';
      errorType = 'USER_NOT_VALID';
      return { game: undefined, error, errorType };
    }

    // Create the game if it does not exist
    if (!this.games.has(gameCode)) {
      this.createGame(gameCode, userId);
      const game = this.games.get(gameCode);
      return { game };
    }

    // Logic for join game by other player.
    const game = this.games.get(gameCode);

    if (game) {
      // Check if the user is already in the game
      if (game.players.some((player) => player.id === userId)) {
        error = 'You are already in this game.';
        errorType = 'USER_ALREADY_IN_GAME';
        return { game, error, errorType };
      }

      // Letting other player join
      const color = game.players[0].color === 'w' ? 'b' : 'w';
      game.players.push({ id: userId, color });
      return { game };
    } else {
      error = 'Game not found in the internal game store!';
      errorType = 'GAME_NOT_FOUND';
    }

    return { game: undefined, error, errorType };
  }

  getGame(gameId: string): WebSocketGameStruct | undefined {
    return this.games.get(gameId);
  }

  removePlayerFromGameByPlayerId(
    playerId: string,
  ): WebSocketGameStruct | undefined {
    let removedGame: WebSocketGameStruct | undefined;
    this.games.forEach((game) => {
      const playerIndex = game.players.findIndex(
        (player) => player.id === playerId,
      );
      if (playerIndex > -1) {
        game.players.splice(playerIndex, 1);
        removedGame = game;
        if (game.players.length === 0) {
          this.games.delete(game.id);
        }
      }
    });
    return removedGame;
  }

  removeGame(gameId: string): void {
    this.games.delete(gameId);
  }

  async inactivePlayer(gameId: string) {
    const gameDetails = await this.gameRepository.findOne({
      where: { inviteCode: gameId },
    });
    const game = this.games.get(gameId);
    const loser = game.players.find(
      (player) => player.color == game.chess.turn(),
    );

    const winner = game.players.find(
      (player) => player.color != game.chess.turn(),
    );

    gameDetails.gameStatus = GameStatus.Completed;
    gameDetails.winnerId = winner.id;
    game.winner = winner.color;
    game.gameOver = true;
    await this.gameRepository.save(gameDetails);
    return {
      error: 'inactiveUser',
      errorType: 'INACTIVE_USER',
      currentPlayer: loser.color,
    };
  }

  async makeMove(
    gameId: string,
    playerId: string,
    move: { from: string; to: string },
  ) {
    const game = this.games.get(gameId);
    if (game) {
      const player = game.players.find((player) => player.id === playerId);
      if (!player || game.chess.turn() !== player.color) {
        return {
          valid: false,
          error: 'Not your turn',
          errorType: 'INVALID_TURN',
        };
      }

      try {
        const moveResult = game.chess.move(move);
        if (moveResult) {
          if (moveResult.captured) {
            if (moveResult.color === 'w') {
              game.capturedBlackPieces.push(moveResult.captured);
            } else {
              game.capturedWhitePieces.push(moveResult.captured);
            }
          }

          // The game details will only be fetched when the game is ended.
          let gameDetails;
          if (
            game.chess.isCheckmate() ||
            game.chess.isStalemate() ||
            game.chess.isDraw()
          ) {
            gameDetails = await this.gameRepository.findOne({
              where: { inviteCode: gameId },
            });
          }

          // Check for game over conditions
          if (game.chess.isCheckmate()) {
            gameDetails.gameStatus = GameStatus.Completed;
            gameDetails.winnerId = player.id;
            game.winner = player.color; // The player who made the move is the winner
            game.gameOver = true;
            await this.gameRepository.save(gameDetails);
            return {
              valid: false,
              error: `Player ${player.color} won`,
              errorType: 'GAME_OVER',
            };
          } else if (game.chess.isStalemate() || game.chess.isDraw()) {
            gameDetails.gameStatus = GameStatus.Draw;
            game.winner = null; // No winner, it's a draw
            game.gameOver = true;
            await this.gameRepository.save(gameDetails);
            return {
              valid: false,
              error: `Game draw`,
              errorType: 'GAME_DRAW',
            };
          }

          return { valid: true, game };
        }
      } catch (e) {
        return {
          valid: false,
          error: 'Not a valid move',
          errorType: 'INVALID_MOVE',
        };
      }
    }
    return {
      valid: false,
      error: 'Game not found',
      errorType: 'GAME_NOT_FOUND',
    };
  }
}
