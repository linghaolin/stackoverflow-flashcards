import React, { Component } from 'react';
import firebase from './firebase.js';
import ReactMarkdown from 'react-markdown';
import Flipcard from '@kennethormandy/react-flipcard';
import '@kennethormandy/react-flipcard/dist/Flipcard.css';
import './CardDeck.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBackward } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
library.add(faBackward)
library.add(faTimes)

class CardDeck extends Component {
    constructor(){
        super();
        this.state = {
            keys: [],
            cards: [],
            flipped: false,
            randomCard: {}
        }
    }
    //step1: fetch data from firebase
    componentDidMount() {
        const dbRef = firebase.database().ref();
        dbRef.on('value', res => {
            const cards = [];
            const keys = [];
            const data = res.val();
            if(!data){
                return <div />;
            }else{
                // push into state
                for(let key in data){
                    cards.push({
                        question: data[key].question,
                        answer: data[key].answer,
                    })
                    keys.push(key);
                }
            }

            //step3: randomize cards, choose only one card to store in state, which is used to print page when renders
            let randomCard = this.randomizeCard(cards);

            this.setState({
                cards: cards,
                randomCard: randomCard,
                keys: keys
            });
        })
    }
    
    // step4: randomize the card function to only put one in state under random card
    randomizeCard = (cards) => {        
        const randomNum = Math.floor(Math.random() * this.state.cards.length);
        return cards[randomNum];
    }
    
    // step5: event handler on next button, so user can switch card for next one
    //the switch function only can be called when there are more than 2 cards in state
    handleSubmit = (event) => {
        event.preventDefault();

        if(this.state.cards.length > 2){
            this.setState({
                randomCard: this.randomizeCard(this.state.cards),
                flipped: false
            });
        } else if (this.state.cards.length === 1){
            alert('Sorry, you only have one card now.')
        } else {
            alert('Sorry, you have no card to show, please add some new and come back to check them out.')
        }
    }

    // step7: delete the card from firebase if user clicks delete button
    handleDelete = (event) => {
        event.preventDefault();
        let cards = this.state.cards;
        let randomCard = this.state.randomCard;
        let cardIndex = cards.indexOf(randomCard);
        let cardId = this.state.keys[cardIndex];

        if(cards.length < 1){
            alert("Sorry, you have no cards to delete");
        }else{
            const dbRef = firebase.database().ref(cardId);
            dbRef.remove();
        }
    }

    // step6：print the card on page
    render(){
        // if(!this.state.randomCard) return <div />
        return(
            <div className="cardDeck">

                <h1>Click the <span>card</span> to check the answer</h1>
                <div className="flashCard">
                <Flipcard flipped={this.state.flipped} onClick={e => this.setState({ flipped: !this.state.flipped })}>
                    <ReactMarkdown source={this.state.randomCard.question} />
                    <ReactMarkdown source={this.state.randomCard.answer} />
                </Flipcard>
                </div>
                <div className="buttonContainer">
                    <button className="nextButton" onClick={this.handleSubmit}>Next</button>
                    <button className="deleteButton" onClick={this.handleDelete}>Delete this card <FontAwesomeIcon icon="times" /></button>
                </div>
                <button className="backButton" onClick={this.props.onBack}>Back <FontAwesomeIcon icon="backward" /></button>

            </div>
        )
    }
}

export default CardDeck;
