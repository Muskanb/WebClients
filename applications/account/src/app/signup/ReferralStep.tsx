import { useState } from 'react';

import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { Loader, ReferralFeaturesList, ReferralHowItWorks, useLoading } from '@proton/components';
import { BRAND_NAME, MAIL_APP_NAME, PLANS } from '@proton/shared/lib/constants';
import { PlanIDs } from '@proton/shared/lib/interfaces';

import Content from '../public/Content';
import Header from '../public/Header';
import Main from '../public/Main';
import Text from '../public/Text';

type PlanType = 'free' | 'trial';

interface Props {
    onPlan: (planIDs: PlanIDs) => Promise<void>;
    onBack?: () => void;
    experiment: { loading: boolean; value: string };
}

const ReferralStep = ({ experiment, onPlan, onBack }: Props) => {
    const [type, setType] = useState<PlanType | undefined>(undefined);
    const [loading, withLoading] = useLoading();

    if (experiment.loading) {
        return <Loader />;
    }

    if (experiment.value === 'B') {
        return (
            <Main>
                <Header title={c('Title').t`How your free trial works`} onBack={onBack} />
                <Content>
                    <Text>
                        {c('Subtitle for trial plan')
                            .t`This offer is for those new to ${BRAND_NAME} only. No credit card required.`}
                    </Text>
                    <ReferralHowItWorks />
                    <Button
                        loading={loading && type === 'trial'}
                        disabled={loading}
                        color="norm"
                        shape="solid"
                        size="large"
                        className="mb0-5"
                        onClick={() => {
                            setType('trial');
                            void withLoading(onPlan({ [PLANS.MAIL]: 1 }));
                        }}
                        fullWidth
                    >{c('Action in trial plan').t`Start my 30-day free trial`}</Button>
                    <Button
                        loading={loading && type === 'free'}
                        disabled={loading}
                        size="large"
                        color="norm"
                        shape="ghost"
                        onClick={() => {
                            setType('free');
                            void withLoading(onPlan({}));
                        }}
                        fullWidth
                    >{c('Action in trial plan').t`Continue with free plan`}</Button>
                </Content>
            </Main>
        );
    }

    return (
        <Main>
            <Header title={c('Title').t`Try the best of ${MAIL_APP_NAME} for free`} onBack={onBack} />
            <Content>
                <Text>
                    {c('Subtitle for trial plan')
                        .t`The privacy-first Mail and Calendar solution for your everyday communications needs.`}
                </Text>
                <ReferralFeaturesList />
                <Button
                    loading={loading && type === 'trial'}
                    disabled={loading}
                    color="norm"
                    shape="solid"
                    size="large"
                    className="mb0-5"
                    onClick={() => {
                        setType('trial');
                        void withLoading(onPlan({ [PLANS.MAIL]: 1 }));
                    }}
                    fullWidth
                >{c('Action in trial plan').t`Try free for 30 days`}</Button>
                <p className="text-center mt0 mb0-5">
                    <small className="color-weak">{c('Info').t`No credit card required`}</small>
                </p>
                <Button
                    loading={loading && type === 'free'}
                    disabled={loading}
                    size="large"
                    color="norm"
                    shape="ghost"
                    onClick={() => {
                        setType('free');
                        void withLoading(onPlan({}));
                    }}
                    fullWidth
                >{c('Action in trial plan').t`No, thanks`}</Button>
            </Content>
        </Main>
    );
};

export default ReferralStep;
