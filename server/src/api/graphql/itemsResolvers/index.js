import returnItemAfterEvaluation from '../../tools/returnItemAfterEvaluation'
import { withRepositories } from '../withRepositories'

export const itemsResolvers = {
  Query: {
    Items: withRepositories(async (root: ?string, args: ?Object, context: Object) => {
      if (context.user) {
        const userDetails = await context.UserDetails.getById(context.user._id)
        return context.Items.getItems(userDetails)
      }
      return []
    }),
    Reviews: withRepositories(async (root: ?string, args: ?Object, context: Object) => {
      if (!context.user) {
        return []
      }
      const userDetails = await context.UserDetails.getById(context.user._id)
      return context.Items.getReviews(context.user._id, userDetails.isCasual)
    }),
    SessionCount: withRepositories(async (root: ?string, args: ?Object, context: Object) => {
      if (context.user) {
        const userDetails = await context.UserDetails.getById(context.user._id)
        return context.Items.getSessionCount(context.user._id, userDetails)
      } else {
        return {}
      }
    })
  },
  Item: {
    flashcard: withRepositories((parentItem, input, context) => context.Flashcards.getFlashcard(parentItem.flashcardId))
  },
  Mutation: {
    createItemsAndMarkLessonAsWatched: withRepositories(async (root: ?string, args: { courseId: string }, context: Object) => {
      let userId = context.user && context.user._id
      if (!userId) {
        console.log('Gozdecki: guestUser')
      }
      const currentLessonPosition = await context.UserDetails.getNextLessonPosition(args.courseId, userId)
      const lesson = await context.Lessons.getCourseLessonByPosition(args.courseId, currentLessonPosition)
      if (!lesson) {
        return {}
      }
      const userDetails = await context.UserDetails.getById(context.user._id)
      const flashcardIds = lesson.flashcardIds
      const flashcards = await context.Flashcards.getFlashcardsByIds(flashcardIds)

      // TODO this should be extracted ant it's functionality properly unit tested
      const ensureNoHardQuestionAtTheBeginning = (flashcards, casualsInRow = 3) => {
        const getCasualFlashcard = () => {
          for (let i = flashcards.length - 1; i >= 0; --i) {
            if (flashcards[i].isCasual) {
              return {flashcard: flashcards[i], index: i}
            }
          }
          return null
        }
        for (let i = 0; i < flashcards.length && i < casualsInRow; ++i) {
          const firstFlashcard = flashcards[i]
          if (!firstFlashcard.isCasual) {
            const casualLookup = getCasualFlashcard()

            if (casualLookup === null) {
              // there is no, casual flashcards
              break
            }

            const {flashcard: casualFlashcard, index} = casualLookup
            if (index !== i) {
              flashcards[index] = firstFlashcard
              flashcards[i] = casualFlashcard
            }
          }
        }
      }

      ensureNoHardQuestionAtTheBeginning(flashcards)
      for (let index = 0; index < flashcards.length; index++) {
        const flashcard = flashcards[index]
        // TODO test for the isCasual case
        if (!userDetails.isCasual || (userDetails.isCasual && flashcard.isCasual)) {
          await context.Items.create(flashcard._id, userId, args.courseId, !!flashcard.isCasual)
        }
      }
      await context.UserDetails.updateNextLessonPosition(args.courseId, userId)
      const nextLessonPosition = await context.UserDetails.getNextLessonPosition(args.courseId, userId)
      return context.Lessons.getCourseLessonByPosition(args.courseId, nextLessonPosition)
    }),
    clearNotCasualItems: withRepositories(async (root: ?string, args: ?Object, context: Object) => {
      const userDetails = await context.UserDetails.getById(context.user._id)
      if (userDetails.isCasual) {
        context.Items.clearNotCasualItems(context.user._id)
      }
      return true
    }),
    processEvaluation: withRepositories(async (root: ?string, args: { itemId: string, evaluation: number }, context: Object) => {
      await context.UserDetails.updateUserXp(context.user._id, 'processEvaluation')
      const item = await context.Items.getItemById(args.itemId, context.user._id)

      // TODO should this be inside a service?
      const newItem = returnItemAfterEvaluation(args.evaluation, item)
      await context.Items.update(args.itemId, newItem, context.user._id)
      const userDetails = await context.UserDetails.getById(context.user._id)
      return context.Items.getItems(userDetails)
    })
  }
}
