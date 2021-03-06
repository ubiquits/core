import { Server, RouteConfig } from './abstract.server';
import { RemoteCli } from '../services/remoteCli.service';
import { Logger } from '../../common/services/logger.service';
import { inject, TestBed, async } from '@angular/core/testing';
import { LoggerMock } from '../../common/services/logger.service.mock';
import { RemoteCliMock } from '../services/remoteCli.service.mock';
import { Response } from '../controllers/response';
import Spy = jasmine.Spy;
import { AuthService } from '../services/auth.service';
import { AuthServiceMock } from '../services/auth.service.mock';
import { ServerMock } from './abstract.server.mock';

describe('Server', () => {

  const providers = [
    {provide: Server, useClass: ServerMock},
    {provide: Logger, useClass: LoggerMock},
    {provide: RemoteCli, useClass: RemoteCliMock},
    {provide: AuthService, useClass: AuthServiceMock},
  ];

  let cliSpy: Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers });
    spyOn(ServerMock.prototype, 'initialize')
      .and
      .callThrough();
    cliSpy = spyOn(RemoteCliMock.prototype, 'start');
  });

  it('initializes the server with port and host', inject([Server], (server: Server) => {

    expect((<any>server).initialize)
      .toHaveBeenCalled();

    expect(cliSpy)
      .toHaveBeenCalledWith(3001);

    expect(server.getHost())
      .toEqual('http://(localhost):3000');

  }));

  it('returns the engine', inject([Server], (server: Server) => {

    expect(server.getEngine())
      .toBe(undefined);

  }));

  it('returns the inner http server instance', inject([Server], (server: Server) => {

    expect(server.getHttpServer())
      .toBe(undefined);

  }));

  it('registers routes', inject([Server], (server: Server) => {

    const routeConfig: RouteConfig = {
      path: '/test',
      methodName: 'test',
      method: 'GET',
      callStack: [],
      callStackHandler: null
    };

    let spy = spyOn(server, 'registerRouteWithEngine');

    server.register(routeConfig);

    expect(spy)
      .toHaveBeenCalledWith(routeConfig);
    expect(server.getRoutes())
      .toEqual([routeConfig]);
  }));

  it('starts the server running and returns promise', async(inject([Server], (server: Server) => {

    let spy = spyOn(server, 'start')
      .and
      .callThrough();

    let response = server.start();

    expect(spy)
      .toHaveBeenCalled();

    return response.then((onStart: Server) => {
      expect(onStart)
        .toEqual(server);
    });

  })));

  it('gets default response object from server', inject([Server], (server: Server) => {
    const response: Response = (<any>server).getDefaultResponse();

    expect(response instanceof Response)
      .toBe(true);

  }));

});


