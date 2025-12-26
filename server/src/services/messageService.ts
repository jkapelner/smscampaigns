import {
  findByIdWithCampaignMessage,
  createMessage,
  updateMessageStatus,
  MessageStatus,
} from '../models';
import { v4 as uuidv4 } from 'uuid';

interface JobQueue {
  campaignId: number;
  contactId: number;
}

const jobQueue: JobQueue[] = [];
let isProcessing = false;

function randomStatus(): MessageStatus {
  const random = Math.random();
  return random < 0.1 ? MessageStatus.UNDELIVERABLE : MessageStatus.SUCCESS;
}

async function processJob(job: JobQueue): Promise<void> {
  try {
    const contactWithCampaign = await findByIdWithCampaignMessage(job.contactId);

    if (!contactWithCampaign) {
      console.error('Contact not found:', job.contactId);
      return;
    }

    const messageId = uuidv4();
    const personalizedMessage = contactWithCampaign.campaignMessage
      .replace('{first_name}', contactWithCampaign.firstName)
      .replace('{last_name}', contactWithCampaign.lastName);

    await createMessage({
      messageId,
      campaignId: job.campaignId,
      contactId: job.contactId,
      message: personalizedMessage,
      status: MessageStatus.PENDING,
    });

    setTimeout(async () => {
      try {
        const status = randomStatus();
        await updateMessageStatus(messageId, status);
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    }, Math.random() * 5000 + 1000);
  } catch (error) {
    console.error('Error processing job:', error);
  }
}

async function processQueue(): Promise<void> {
  if (isProcessing || jobQueue.length === 0) {
    return;
  }

  isProcessing = true;

  while (jobQueue.length > 0) {
    const job = jobQueue.shift();
    if (job) {
      await processJob(job);
    }
  }

  isProcessing = false;
}

export function addToQueue(campaignId: number, contactId: number): void {
  jobQueue.push({ campaignId, contactId });
  processQueue();
}
