import React from 'react';
import {graphql} from 'react-apollo';
import gql from 'graphql-tag';
import update from 'immutability-helper';
import { Link } from 'react-router';

// const createMessage = gql`
//     mutation addMessage($channelName: String!, $handle: String!, $message: String!) {
//         addMessage(channelName: $channelName, handle: $handle, message:$message) {
//             handle, message
//         }
//     }`;
//

export class WellDone extends React.Component {
    componentDidMount() {
        this.props.lessonWatchedMutation();
    }
    render() {
        return <div className="welldone">
            First video done! Click: <Link to={`/questions`}>here</Link> to answer some questions about the video
        </div>
    }
}

const lessonWatchedMutationSchema = gql`
    mutation createItemsAndMarkLessonAsWatched{
        createItemsAndMarkLessonAsWatched{
            _id, position, description, flashcardIds, youtubeId
        }
    }
`;


export default graphql(lessonWatchedMutationSchema, {
    props: ({ownProps, mutate}) => ({
        lessonWatchedMutation: () => mutate({
            updateQueries: {
                Lesson: (prev, {mutationResult}) => {
                    console.log("JMOZGAWA: mutationResult",mutationResult);
                    const updateResults = update(prev, {
                        Lesson: {
                            $set: mutationResult.data.createItemsAndMarkLessonAsWatched
                        }
                    });
                    return updateResults;
                }
            }
        })
    })
})(WellDone);
