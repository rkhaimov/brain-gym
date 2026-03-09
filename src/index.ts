import { agent } from './core/agent';
import { Message } from './core/llm/message-types';
import { openai } from './core/llm/openai';
import { tool } from './core/tool';
import { ask } from './core/user/ask';
import { confirm } from './core/user/confirm';
import { UserProvider } from './core/user/UserContext';
import { createEmailWriter, EMAIL_META_SCHEMA } from './createEmailWriter';
import {
  createEventExtractor,
  EVENT_QUERY_SCHEMA,
} from './createEventExtractor';
import { render } from './render';
import { Either } from './utils/Either';

// https://docs.langchain.com/oss/javascript/langchain/multi-agent/handoffs-customer-support
// TODO: Add current user context
// I want to invite john@mail.com and rico@rambler.com to my birthday party which will be tomorrow at 2 PM.
async function main() {
  return UserProvider({ name: 'George', email: 'george@rambler.com' }, () =>
    render(run()),
  );
}

async function* run() {
  let history: Message[] = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
  ];

  process.stdout.write('What would you like for me to do?');

  while (true) {
    const asked = await ask();

    if (Either.isLeft(asked)) {
      return asked;
    }

    const result = yield* agent(
      [
        ...history,
        {
          role: 'user',
          content: asked.value,
        },
      ],
      { llm: openai, tools: [arrangeEvent, writeAnEmail] },
    );

    if (Either.isLeft(result)) {
      return result;
    }

    history = result.value;
  }
}

const arrangeEvent = tool({
  name: 'arrangeEvent',
  description: 'Arranges an event parsed from a query',
  schema: EVENT_QUERY_SCHEMA,
  fn: async function* (args) {
    const result = yield* createEventExtractor(args);

    if (Either.isLeft(result)) {
      return `Could not extract event information.\n\nReason: ${JSON.stringify(result.value, null, 2)}`;
    }

    console.log('\n\nWould you like to arrange this event?');
    console.log(JSON.stringify(result.value, null, 2));

    const confirmed = await confirm();

    if (Either.isLeft(confirmed)) {
      return `Confirmation failed: ${JSON.stringify(confirmed.value, null, 2)}`;
    }

    if (confirmed.value === true) {
      return 'Event has been arranged';
    }

    return `User declined arrangement with a comment: "${confirmed.value}"`;
  },
});

const writeAnEmail = tool({
  name: 'writeAnEmail',
  description: 'Writes an email given required information and sends it',
  schema: EMAIL_META_SCHEMA,
  fn: async function* (args) {
    const result = yield* createEmailWriter(args);

    if (Either.isLeft(result)) {
      return `Could not write an email.\n\nReason: ${JSON.stringify(result.value, null, 2)}`;
    }

    console.log('\n\nWould you like to send this email?');
    console.log('Title:', result.value.title);
    console.log('Content:', result.value.content);

    const confirmed = await confirm();

    if (Either.isLeft(confirmed)) {
      return `Confirmation failed: ${JSON.stringify(confirmed.value, null, 2)}`;
    }

    if (confirmed.value === true) {
      return 'Email has been sent';
    }

    return `Email was not sent. User declined with a comment: "${confirmed.value}"`;
  },
});

const SYSTEM_PROMPT = `
You are helpful personal assistant.

# Capabilities

* You can schedule calendar events using ${arrangeEvent.meta.function.name} tool.
* You can write and send emails to users using ${writeAnEmail.meta.function.name} tool.

# Important

You can only call one tool at a time.

# Arrangment rules
 
* After user asked to arrange an event you must pass query (as is) to ${arrangeEvent.meta.function.name} tool.
* ${arrangeEvent.meta.function.name} will try to extract important event details like title, starting date, attendees, etc.
* After ${arrangeEvent.meta.function.name} successful response you must send invintations to all attendees.
* When calling ${writeAnEmail.meta.function.name} after ${arrangeEvent.meta.function.name} you must pass all known event details to \`about\` property.

<example>
Tool ${arrangeEvent.meta.function.name} - "{EVENT_INFORMATION}"
Assitant calling ${writeAnEmail.meta.function.name} with { "about": "Write an invintation email for this event: {EVENT_INFORMATION}", to: "{ATTENDEE}" }
</example>

* You can not work on two or more events simultaneously, instead you must deal with them sequantially.

<example>
User - "Schedule a mitting on 10 march at 10:00 and also a birthday party on 15 march at 15:00"
Agent - "Okay, first I am going to create a mitting event and send emails to attendees, only then I am going to deal with birthday event"
</example>

* When ${arrangeEvent.meta.function.name} or ${writeAnEmail.meta.function.name} fails try to correct errors by yourself if and only if it does not require from you to invent new information.

<example>
User - "Schedule a mitting on 10 march"
Agent - "Okay, delegate this query to ${arrangeEvent.meta.function.name} tool"
Tool - "Duration is missing"
Agent - "It is not a typo, duration is missing in user query, I can not invent that, so I delegate it to a user"
</example>

# General rules

* When user query is not clearly about arranging an event or sending an email you must reject kindly.

<example>
User - "The sun outside is bright"
Agent - "I am sorry, I can only send emails and/or arrange events"
</example>
`;

void main();
