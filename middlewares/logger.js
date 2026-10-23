import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import chalk from 'chalk';
import moment from 'moment';

const logsDir = path.resolve('logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

export const consoleLogger = morgan((tokens, req, res) => {
    const status = tokens.status(req, res);
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const responseTime = tokens['response-time'](req, res);
    const date = moment().format('YYYY-MM-DD HH:mm:ss');

    const statusNum = parseInt(status, 10);
    let colorizeStatus = chalk.green;
    if (statusNum >= 500) {
        colorizeStatus = chalk.red.bold;
    } else if (statusNum >= 400) {
        colorizeStatus = chalk.yellow.bold;
    } else if (statusNum >= 300) {
        colorizeStatus = chalk.cyan;
    }

    return [
        chalk.gray(`[${date}]`),
        chalk.blue.bold(method),
        chalk.white(url),
        colorizeStatus(status),
        chalk.magenta(`${responseTime} ms`)
    ].join(' ');
});

export const fileErrorLoggerMiddleware = (req, res, next) => {
    res.on('finish', () => {
        if (res.statusCode >= 400) {
            const todayStr = moment().format('YYYY-MM-DD');
            const logFilePath = path.join(logsDir, `${todayStr}.log`);
            const timeStr = moment().format('YYYY-MM-DD HH:mm:ss');
            const logEntry = `[${timeStr}] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Client: ${req.ip || 'unknown'}\n`;

            fs.appendFile(logFilePath, logEntry, (writeErr) => {
                if (writeErr) {
                    console.error(chalk.red('Failed to write to error log file:'), writeErr);
                }
            });
        }
    });
    next();
};

export const fileErrorLogger = (err, req, res, next) => {
    const status = err.status || 500;
    const errorMessage = err.message || 'Internal Server Error';

    const todayStr = moment().format('YYYY-MM-DD');
    const logFilePath = path.join(logsDir, `${todayStr}.log`);
    const timeStr = moment().format('YYYY-MM-DD HH:mm:ss');
    const logEntry = `[${timeStr}] URL: ${req.method} ${req.originalUrl} | Status: ${status} | Error: ${errorMessage}\n`;

    fs.appendFile(logFilePath, logEntry, () => {});

    return res.status(status).send({ message: errorMessage });
};
