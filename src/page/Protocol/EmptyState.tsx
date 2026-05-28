import { useTranslation } from 'react-i18next'

export const EmptyState = () => {
  const { t } = useTranslation()
  return <p className="py-8 text-center text-muted-foreground">{t('tables.empty')}</p>
}
