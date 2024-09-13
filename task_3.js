const crypto = require('crypto');
const readline = require('readline');

// Генерация 256-битного ключа
function generateKey() {
    return crypto.randomBytes(32).toString('hex');
}

// Генерация HMAC
function generateHMAC(key, message) {
    return crypto.createHmac('sha256', key).update(message).digest('hex');
}

// Проверка аргументов командной строки
const args = process.argv.slice(2);

if (args.length < 3 || args.length % 2 === 0) {
    console.log('Error: Please provide an odd number of moves (3 or more).');
    process.exit(1);
}

// Выбор хода компьютера
function getRandomMove(moves) {
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
}

const computerMove = getRandomMove(args);
const secretKey = generateKey();
const hmac = generateHMAC(secretKey, computerMove);

console.log(`HMAC: ${hmac}`);  // Показать HMAC до выбора хода

// Отображение меню
function displayMenu(moves) {
    console.log('\nAvailable moves:');
    moves.forEach((move, index) => {
        console.log(`${index + 1} - ${move}`);
    });
    console.log('0 - Exit');
    console.log('? - Help');
}

displayMenu(args);

// Генерация таблицы помощи
class HelpTable {
    constructor(moves) {
        this.moves = moves;
        this.size = moves.length;
    }

    // Генерация
    generate() {
        console.log('\nHelp Table:');
        console.log('PC\\User', this.moves.join('\t'));
        this.moves.forEach((move, i) => {
            let row = `${move}`;
            this.moves.forEach((opponentMove, j) => {
                if (i === j) {
                    row += '\tDraw';
                } else if ((i < j && j - i <= this.size / 2) || (i > j && i - j > this.size / 2)) {
                    row += '\tWin';
                } else {
                    row += '\tLose';
                }
            });
            console.log(row);
        });
    }
}

// Получение результата игры
function getResult(userMove, computerMove, moves) {
    const userIndex = moves.indexOf(userMove);
    const computerIndex = moves.indexOf(computerMove);
    if (userIndex === computerIndex) {
        return 'Draw';
    } else if ((userIndex < computerIndex && computerIndex - userIndex <= moves.length / 2) ||
        (userIndex > computerIndex && userIndex - computerIndex > moves.length / 2)) {
        return 'You win!';
    } else {
        return 'Computer wins!';
    }
}

// Чтение ввода пользователя
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your move: ', (input) => {
    if (input === '0') {
        console.log('Goodbye!');
        process.exit(0);
    } else if (input === '?') {
        const helpTable = new HelpTable(args);
        helpTable.generate();
        rl.close();
    } else {
        const userMove = args[parseInt(input) - 1];
        if (!userMove) {
            console.log('Invalid move!');
            rl.close();
        } else {
            const result = getResult(userMove, computerMove, args);
            console.log(`Your move: ${userMove}`);
            console.log(`Computer move: ${computerMove}`);
            console.log(result);
            console.log(`HMAC key: ${secretKey}`);
            rl.close();
        }
    }
});
