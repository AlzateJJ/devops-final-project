"""Clasificación editorial de herramientas adicionales; fuentes oficiales consultadas 2026-11-18."""
OPEN_REPOS={121:'cypress-io/cypress',122:'microsoft/playwright',123:'postmanlabs/newman',126:'jestjs/jest',127:'DevExpress/testcafe',131:'grafana/grafana',133:'npm/cli',137:'gradle/gradle',138:'yarnpkg/berry',139:'apache/maven',140:'vitejs/vite',141:'webpack/webpack',142:'juju/juju',144:'pulumi/pulumi'}
PRICES={f'H{n:03}':{'model':'OS','source':'https://github.com/'+repo,'scope':'Clasificación del proyecto de código abierto. Los servicios alojados, soporte o ediciones comerciales asociados pueden tener otro modelo.','checked':'2026-11-18'} for n,repo in OPEN_REPOS.items()}
for n,model,url,scope in [
    (124,'PA','https://www.mabl.com/pricing','Suscripción comercial cotizada; una prueba temporal no equivale a un plan gratuito permanente.'),
    (125,'FM','https://www.postman.com/pricing/','Plan gratuito y planes comerciales de la plataforma Postman.'),
    (128,'FM','https://sentry.io/pricing/','Servicio alojado: plan Developer gratuito y planes de pago.'),
    (129,'FM','https://docs.bugsnag.com/product/plans-and-billing/','Servicio alojado con plan gratuito limitado y suscripciones de pago.'),
    (130,'PA','https://aws.amazon.com/cloudwatch/pricing/','Servicio cobrado por uso con determinadas cuotas gratuitas; no implica que todos sus usos sean gratuitos.'),
    (132,'FM','https://www.elastic.co/subscriptions','Distribución autogestionada con nivel Basic gratuito y suscripciones con capacidades adicionales.'),
    (134,'FM','https://www.atlassian.com/software/bitbucket/pricing','Pipelines se incluye en planes de Bitbucket con límites y opciones de pago.'),
    (135,'FM','https://github.com/pricing','Actions se ofrece con cuotas incluidas y consumo o capacidades de pago según el plan y la ejecución.'),
    (136,'FM','https://about.gitlab.com/pricing/','CI/CD forma parte de los niveles gratuitos y comerciales de GitLab; los ejecutores e infraestructura pueden generar costos.'),
    (143,'FR','https://aws.amazon.com/cloudformation/pricing/','La clasificación Free se limita a CloudFormation para proveedores AWS::* y Alexa::* sin cargo adicional. Los recursos creados, hooks personalizados y proveedores de terceros pueden tener costos.')]:
    PRICES[f'H{n:03}']={'model':model,'source':url,'scope':scope,'checked':'2026-11-18'}
assert len(PRICES)==24
