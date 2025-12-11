export type FileType = 'file' | 'folder';

export interface FileNode {
    id: string;
    name: string;
    type: FileType;
    language?: 'php' | 'yml' | 'xml' | 'json';
    content?: string;
    children?: FileNode[];
    isOpen?: boolean;
}

export const projectFiles: FileNode[] = [
    {
        id: 'root',
        name: 'magento-cloud',
        type: 'folder',
        isOpen: true,
        children: [
            {
                id: 'docker',
                name: '.docker',
                type: 'folder',
                isOpen: true,
                children: [
                    {
                        id: 'docker-compose.yml',
                        name: 'docker-compose.yml',
                        type: 'file',
                        language: 'yml',
                        content: `version: "3"\n\nservices:\n  app:\n    image: magento/magento-cloud:2.4.6\n    ports:\n      - "8080:80"\n    volumes:\n      - ./src:/app\n    depends_on:\n      - db\n      - redis\n      - elasticsearch\n\n  db:\n    image: mariadb:10.4\n    environment:\n      MYSQL_ROOT_PASSWORD: root\n      MYSQL_DATABASE: magento\n\n  redis:\n    image: redis:6.2-alpine\n\n  elasticsearch:\n    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.0\n    environment:\n      - discovery.type=single-node\n\n  varnish:\n    image: varnish:7.0\n    ports:\n      - "80:80"`
                    }
                ]
            },
            {
                id: 'app',
                name: 'app',
                type: 'folder',
                isOpen: true,
                children: [
                    {
                        id: 'code',
                        name: 'code',
                        type: 'folder',
                        isOpen: true,
                        children: [
                            {
                                id: 'Vendor',
                                name: 'Vendor',
                                type: 'folder',
                                isOpen: true,
                                children: [
                                    {
                                        id: 'Payment',
                                        name: 'StripeIntegration',
                                        type: 'folder',
                                        isOpen: true,
                                        children: [
                                            {
                                                id: 'Observer',
                                                name: 'Observer',
                                                type: 'folder',
                                                isOpen: true,
                                                children: [
                                                    {
                                                        id: 'PaymentCapture.php',
                                                        name: 'PaymentCapture.php',
                                                        type: 'file',
                                                        language: 'php',
                                                        content: `<?php\n\nnamespace Vendor\\StripeIntegration\\Observer;\n\nuse Magento\\Framework\\Event\\Observer;\nuse Magento\\Framework\\Event\\ObserverInterface;\nuse Stripe\\PaymentIntent;\n\nclass PaymentCapture implements ObserverInterface\n{\n    protected $logger;\n    protected $stripeClient;\n\n    public function __construct(\n        \\Psr\\Log\\LoggerInterface $logger,\n        \\Vendor\\StripeIntegration\\Model\\Client $stripeClient\n    ) {\n        $this->logger = $logger;\n        $this->stripeClient = $stripeClient;\n    }\n\n    public function execute(Observer $observer)\n    {\n        $order = $observer->getEvent()->getOrder();\n        $payment = $order->getPayment();\n\n        try {\n            $intent = $this->stripeClient->capture(\n                $payment->getLastTransId(),\n                $order->getTotalDue()\n            );\n\n            if ($intent->status === 'succeeded') {\n                $payment->setIsTransactionClosed(true);\n                $this->logger->info("Order {$order->getId()} captured.");\n            }\n        } catch (\\Exception $e) {\n            $this->logger->critical($e->getMessage());\n            throw new \\Magento\\Framework\\Exception\\LocalizedException(\n                __('Payment capture failed.')\n            );\n        }\n    }\n}`
                                                    }
                                                ]
                                            },
                                            {
                                                id: 'etc',
                                                name: 'etc',
                                                type: 'folder',
                                                children: [
                                                    {
                                                        id: 'events.xml',
                                                        name: 'events.xml',
                                                        type: 'file',
                                                        language: 'xml',
                                                        content: `<?xml version="1.0"?>\n<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n    <event name="sales_order_payment_capture">\n        <observer name="vendor_stripe_capture" instance="Vendor\\StripeIntegration\\Observer\\PaymentCapture" />\n    </event>\n</config>`
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'env.php',
                name: 'env.php',
                type: 'file',
                language: 'php',
                content: `<?php\nreturn [\n    'backend' => [\n        'frontName' => 'admin_secure'\n    ],\n    'queue' => [\n        'consumers_wait_for_messages' => 1\n    ],\n    'crypt' => [\n        'key' => '8c0989e2...'\n    ],\n    'db' => [\n        'table_prefix' => '',\n        'connection' => [\n            'default' => [\n                'host' => 'db',\n                'dbname' => 'magento',\n                'username' => 'root',\n                'password' => 'root',\n                'model' => 'mysql4',\n                'engine' => 'innodb',\n                'initStatements' => 'SET NAMES utf8;'\n            ]\n        ]\n    ],\n    'resource' => [\n        'default_setup' => [\n            'connection' => 'default'\n        ]\n    ]\n];`
            }
        ]
    }
];