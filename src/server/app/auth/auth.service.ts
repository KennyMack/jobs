import { BaseStateService } from '@app/base.service';
import { getIssuer } from '@app/environment';
import { User, UserEntity } from '@users/user.entity';
import { generateToken, checkToken } from '@utils/jwt';
import * as bcrypt from 'bcrypt';



export class AuthService extends BaseStateService {
  async tokenValid(token: string): Promise<User | null> {
    const decodedData = checkToken(token);

    if (!decodedData.valid) {
      return null;
    }

    const user = await UserEntity.findById(decodedData.data!.userId);

    if (!user) {
      return null;
    }

    return user;
  }

  async login(taxId: string, password: string): Promise<string> {
    const user = await UserEntity.findOne({
      taxId
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      super.addError('Invalid user or password');
      return '';
    }

    const result = generateToken({
      issuer: getIssuer(),
      subject: user._id.toString(),
      data: {
        userId: user._id.toString()
      }
    })

    return result;// user._id.toString();
  }
}
