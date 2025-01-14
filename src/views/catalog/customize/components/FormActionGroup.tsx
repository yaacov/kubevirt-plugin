import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ActionGroup, Button } from '@patternfly/react-core';

type FormActionGroupProps = {
  loading: boolean;
  onCancel?: () => Promise<{
    metadata: {
      name: string;
      namespace: string;
    };
  }>;
};

export const FormActionGroup: React.FC<FormActionGroupProps> = ({ loading, onCancel }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const goBack = React.useCallback(() => {
    history.goBack();
  }, [history]);

  const handleCancel = React.useCallback(() => {
    onCancel?.().catch(console.error);
    goBack();
  }, [goBack, onCancel]);

  return (
    <ActionGroup>
      <Button
        variant="primary"
        type="submit"
        isDisabled={loading}
        isLoading={loading}
        data-test-id="customize-vm-submit-button"
      >
        {t('Next')}
      </Button>
      <Button variant="link" onClick={handleCancel}>
        {t('Cancel')}
      </Button>
    </ActionGroup>
  );
};
