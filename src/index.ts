import { createIssueTypeAgent } from './createIssueTypeAgent';
import { createResolutionAgent } from './createResolutionAgent';
import { createWarrantyCollectorAgent } from './createWarrantyCollectorAgent';
import { render } from './render';
import { Either } from './utils/Either';

// https://docs.langchain.com/oss/javascript/langchain/multi-agent/router-knowledge-base
async function main() {
  return render(run());
}

async function* run() {
  const type = yield* createIssueTypeAgent();

  if (Either.isLeft(type)) {
    return type;
  }

  console.log('\n\nGoing to warranty specialist\n');

  const warranty = yield* createWarrantyCollectorAgent(type.value.state);

  if (Either.isLeft(warranty)) {
    return warranty;
  }

  if (
    type.value.type === 'hardware' &&
    warranty.value.status === 'out_of_warranty'
  ) {
    console.log('\n\nWe are sorry but you have to pay for hardware issues');

    return;
  }

  console.log('\n\nGoing to resolution specialist\n');

  return yield* createResolutionAgent(
    warranty.value.state,
    type.value.type,
    warranty.value.status,
  );
}

void main();
