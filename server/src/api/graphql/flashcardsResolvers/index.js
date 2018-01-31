// @flow
import { flashcardRepository } from '../../repositories/FlashcardsRepository'

const repositoriesContext = {
  Flashcards: flashcardRepository
}

export const flashcardsResolvers = {
  Query: {
    Flashcards (root: ?string, args: ?Object, passedContext: Object) {
      const context = {...repositoriesContext, ...passedContext}

      return context.Flashcards.getFlashcards()
    },
    Flashcard (root: ?string, args: { _id: string }, passedContext: Object) {
      const context = {...repositoriesContext, ...passedContext}

      return context.Flashcards.getFlashcard(args._id)
    }
  }
}