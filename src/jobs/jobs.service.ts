import { Injectable } from '@nestjs/common';
import * as schedule from 'node-schedule';
import jobConfig from './job.config';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

@Injectable()
export class JobsService {
  constructor() {
    this.initializeJobs();
  }

  async initializeJobs() {
    const { tasks } = jobConfig;

    tasks.forEach((task) => {
      const { cron, taskName } = task;
      schedule.scheduleJob(cron, () => {
        console.log(
          '--------------------------- START JOB -----------------------------',
        );
        console.log(
          `O Job ${taskName} do serviço ${task.service}, está em execução.`,
        );
        if (task.method == 'HTTP') {
          console.log(`Job acionado via HTTTP: POST ${task.url}${task.path}`);
        } else if (task.method == 'SQS') {
          console.log(
            `Job acionado via SQS: Mensagem enviada para fila ${task.queue} com a action ${task.action}`,
          );
          const client = new SQSClient({
            region: 'us-east-1',
            credentials: {
              accessKeyId: task.key_id,
              secretAccessKey: task.access_key,
            },
            endpoint: 'http://sqs.us-east-1.localhost.localstack.cloud:4566',
          });
          const SQS_QUEUE_URL = `http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/${task.queue}`;

          const params = {
            QueueUrl: SQS_QUEUE_URL,
            MessageBody: 'Conteúdo da mensagem',
          };
          const command = new SendMessageCommand(params);
          client
            .send(command)
            .then((response) => {
              console.log('Mensagem enviada com sucesso:', response.MessageId);
            })
            .catch((error) => {
              console.error('Erro ao enviar mensagem para a fila:', error);
            })
            .finally(() => {
              console.log(
                '---------------------------- END JOB ------------------------------',
              );
            });
        }
      });
    });
  }
}
