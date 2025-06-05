document.addEventListener('DOMContentLoaded', function() {
    // 获取职业测评问题
    fetch('http://localhost:3000/questions')
        .then(response => response.json())
        .then(questions => {
            const questionsContainer = document.getElementById('questionsContainer');
            questions.forEach((question, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question';

                const questionText = document.createElement('p');
                questionText.innerText = (index + 1) + '. ' + question.question_text;
                questionDiv.appendChild(questionText);

                [question.option_1, question.option_2, question.option_3, question.option_4, question.option_5].forEach(option => {
                    if (option) {
                        const optionLabel = document.createElement('label');
                        const optionInput = document.createElement('input');
                        optionInput.type = 'radio';
                        optionInput.name = 'question_' + question.id;
                        optionInput.value = option;
                        optionInput.required = true;
                        optionLabel.appendChild(optionInput);
                        optionLabel.appendChild(document.createTextNode(option));
                        questionDiv.appendChild(optionLabel);
                        questionDiv.appendChild(document.createElement('br'));
                    }
                });

                questionsContainer.appendChild(questionDiv);
            });
        })
        .catch(error => {
            console.error('获取问题失败:', error);
            alert('无法获取测评问题，请稍后重试');
        });
});
