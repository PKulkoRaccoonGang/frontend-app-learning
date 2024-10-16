import React from 'react';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import { getLoginRedirectUrl } from '@edx/frontend-platform/auth';
import { Alert, Hyperlink } from '@edx/paragon';
import { WarningFilled } from '@edx/paragon/icons';

import genericMessages from '../../generic/messages';

const LogistrationAlert = ({ intl }) => {
  const signIn = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={`${getLoginRedirectUrl(global.location.href)}`}
    >
      {intl.formatMessage(genericMessages.signInLowercase)}
    </Hyperlink>
  );

  return (
    <Alert variant="warning" icon={WarningFilled}>
      <FormattedMessage
        id="learning.logistration.alert"
        description="Prompts the user to sign in or register to see course content."
        defaultMessage="To see course content, {signIn}."
        values={{ signIn }}
      />
    </Alert>
  );
};

LogistrationAlert.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(LogistrationAlert);
