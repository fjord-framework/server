const ClientsManager = require('../lib/clientsManager');

let clients;

beforeEach(() => {
  const JWT_KEY = 'jqq247gjrhvariorrbgehtcwz5k0x0slmmxndnde';
  const API_TOPICS = 'test';
  clients = new ClientsManager(JWT_KEY, API_TOPICS);
});

describe('ClientsManager instantiation', () => {
  test('JWT is set as an attribute on ClientManager instances', () => {
    expect(clients.JWT_KEY.length).toEqual(40);
  });

  test('topics has length of two', () => {
    expect(clients.topics.length).toEqual(2);
  });

  test('client list is empty object', () => {
    expect(clients.list).toBeInstanceOf(Object);
  });

  test('headers are present', () => {
    expect(clients.responseHeaders).toMatchObject({
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
    });
  });
});

describe('ClientsManager helper methods function properly', () => {
  test('validateRequest works with invalid inputs', () => {
    expect(clients.validateRequest({})).toMatchObject({valid: false, code: 406, error: 'Invalid topic'});
  });

  test('validateRequest works with valid topic', () => {
    const ClientsWithoutToken = new ClientsManager(false, 'test');
    expect(ClientsWithoutToken.validateRequest({topic: 'test'})).toMatchObject({valid: true});
  });

  test('addClient adds client object to list associated with topic when client has short id', () => {
    clients.addClient('test', '111');
    expect(clients.list.test).toMatchObject(clients.list['test']);
  });

  test('addClient adds client object to list associated with topic when client has no id', () => {
    clients.addClient('test');
    expect(clients.list.test).toMatchObject(clients.list['test']);
  });
});