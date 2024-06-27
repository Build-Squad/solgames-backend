import { Injectable } from '@nestjs/common';
import { Chess } from 'chess.js';

interface Game {
  id: string;
  chess: Chess;
  players: string[];
  turn: 'w' | 'b';
  capturedWhitePieces: string[];
  capturedBlackPieces: string[];
}

@Injectable()
export class GameService {
  private games: Map<string, Game> = new Map();

  createGame(gameId: string): Game {
    const chess = new Chess();
    const game: Game = {
      id: gameId,
      chess,
      players: [],
      turn: 'w',
      capturedWhitePieces: [],
      capturedBlackPieces: [],
    };
    this.games.set(gameId, game);
    return game;
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  addPlayerToGame(gameId: string, playerId: string): Game | undefined {
    const game = this.games.get(gameId);
    if (game && game.players.length < 2) {
      game.players.push(playerId);
      return game;
    }
    return undefined;
  }

  makeMove(
    gameId: string,
    move: { from: string; to: string },
  ): { valid: boolean; game?: Game; error?: string } {
    const game = this.games.get(gameId);
    if (game) {
      const moveResult = game.chess.move(move);
      if (moveResult) {
        if (moveResult.captured) {
          if (moveResult.color === 'w') {
            game.capturedBlackPieces.push(moveResult.captured);
          } else {
            game.capturedWhitePieces.push(moveResult.captured);
          }
        }
        game.turn = game.chess.turn();
        return { valid: true, game };
      }
      return { valid: false, error: 'Invalid move' };
    }
    return { valid: false, error: 'Game not found' };
  }
}
