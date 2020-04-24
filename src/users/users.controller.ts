import {
  Controller,
  Get,
  Request,
  UseGuards,
  UsePipes,
  UseInterceptors,
  ValidationPipe,
  Post,
  Body,
  HttpCode,
} from '@nestjs/common'
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { UsersService } from './users.service'
import { TempID } from './classes/temp-id.class'
import { FirebaseNormalUserValidateGuard } from '../auth/guards/firebase-normal-user-validate.guard'
import { VALIDATION_PIPE_OPTIONS } from '../constants/validation-pipe'
import { CreateCloseContactsRequestDto } from './dto/create-close-contact.dto'
import { CreatedResponseInterceptor } from '../shared/interceptors/created-response.interceptor'
import { CreatedResponse } from '../shared/classes/created-response.class'

@ApiTags('app')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(FirebaseNormalUserValidateGuard)
@UseInterceptors(CreatedResponseInterceptor)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: "Find users' own TempIDs" })
  @ApiOkResponse({ type: [TempID] })
  @Get('/me/temp_ids')
  async getMeTempIDs(@Request() req): Promise<TempID[]> {
    const userId = req.user.uid
    return this.usersService.getTempIDs(userId)
  }

  @UsePipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS))
  @ApiOperation({ summary: 'Receive close contacts payload from user' })
  @ApiOkResponse({ type: CreatedResponse })
  @Post('/me/close_contacts')
  @HttpCode(200)
  async postMeCloseContacts(
    @Request() req,
    @Body() createCloseContactsRequestDto: CreateCloseContactsRequestDto
  ): Promise<CreatedResponse> {
    await this.usersService.createCloseContacts(req.user.uid, createCloseContactsRequestDto)
    return {}
  }
}
