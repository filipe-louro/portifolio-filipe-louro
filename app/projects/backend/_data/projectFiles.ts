export type FileType = 'file' | 'folder';

export interface FileNode {
    id: string;
    name: string;
    type: FileType;
    language?: 'php' | 'json' | 'env';
    content?: string;
    children?: FileNode[];
    isOpen?: boolean;
}

export const projectFiles: FileNode[] = [
    {
        id: 'root',
        name: 'laravel-api',
        type: 'folder',
        isOpen: true,
        children: [
            {
                id: 'app',
                name: 'app',
                type: 'folder',
                isOpen: true,
                children: [
                    {
                        id: 'http',
                        name: 'Http',
                        type: 'folder',
                        isOpen: true,
                        children: [
                            {
                                id: 'controllers',
                                name: 'Controllers',
                                type: 'folder',
                                isOpen: true,
                                children: [
                                    {
                                        id: 'UserController.php',
                                        name: 'UserController.php',
                                        type: 'file',
                                        language: 'php',
                                        content: `<?php\n\nnamespace App\\Http\\Controllers;\n\nuse App\\Models\\User;\nuse Illuminate\\Http\\Request;\nuse Illuminate\\Http\\JsonResponse;\n\nclass UserController extends Controller\n{\n    public function index(): JsonResponse\n    {\n        $users = User::paginate(10);\n        return response()->json($users);\n    }\n\n    public function show(int $id): JsonResponse\n    {\n        $user = User::findOrFail($id);\n        return response()->json(['data' => $user]);\n    }\n\n    public function store(Request $request): JsonResponse\n    {\n        $validated = $request->validate([\n            'name' => 'required|string|max:255',\n            'email' => 'required|email|unique:users',\n            'password' => 'required|min:8'\n        ]);\n\n        $user = User::create($validated);\n\n        return response()->json($user, 201);\n    }\n}`
                                    },
                                    {
                                        id: 'AuthController.php',
                                        name: 'AuthController.php',
                                        type: 'file',
                                        language: 'php',
                                        content: `<?php\n\nnamespace App\\Http\\Controllers;\n\nuse Illuminate\\Http\\Request;\nuse Illuminate\\Support\\Facades\\Auth;\n\nclass AuthController extends Controller\n{\n    public function login(Request $request)\n    {\n        $credentials = $request->only('email', 'password');\n\n        if (Auth::attempt($credentials)) {\n            $token = $request->user()->createToken('api_token');\n            return response()->json(['token' => $token->plainTextToken]);\n        }\n\n        return response()->json(['error' => 'Unauthorized'], 401);\n    }\n}`
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'models',
                        name: 'Models',
                        type: 'folder',
                        isOpen: false,
                        children: [
                            {
                                id: 'User.php',
                                name: 'User.php',
                                type: 'file',
                                language: 'php',
                                content: `<?php\n\nnamespace App\\Models;\n\nuse Illuminate\\Database\\Eloquent\\Factories\\HasFactory;\nuse Illuminate\\Foundation\\Auth\\User as Authenticatable;\nuse Illuminate\\Notifications\\Notifiable;\nuse Laravel\\Sanctum\\HasApiTokens;\n\nclass User extends Authenticatable\n{\n    use HasApiTokens, HasFactory, Notifiable;\n\n    protected $fillable = [\n        'name',\n        'email',\n        'password',\n    ];\n\n    protected $hidden = [\n        'password',\n        'remember_token',\n    ];\n}`
                            }
                        ]
                    }
                ]
            },
            {
                id: 'routes',
                name: 'routes',
                type: 'folder',
                isOpen: true,
                children: [
                    {
                        id: 'api.php',
                        name: 'api.php',
                        type: 'file',
                        language: 'php',
                        content: `<?php\n\nuse Illuminate\\Http\\Request;\nuse Illuminate\\Support\\Facades\\Route;\nuse App\\Http\\Controllers\\UserController;\nuse App\\Http\\Controllers\\AuthController;\n\n/*\n|--------------------------------------------------------------------------\n| API Routes\n|--------------------------------------------------------------------------\n*/\n\nRoute::post('/login', [AuthController::class, 'login']);\n\nRoute::middleware('auth:sanctum')->group(function () {\n    Route::apiResource('users', UserController::class);\n    Route::get('/user', function (Request $request) {\n        return $request->user();\n    });\n});`
                    }
                ]
            },
            {
                id: 'env',
                name: '.env',
                type: 'file',
                language: 'env',
                content: `APP_NAME=Laravel\nAPP_ENV=local\nAPP_KEY=base64:randomkeygeneratedbyartisan\nAPP_DEBUG=true\nAPP_URL=http://localhost\n\nDB_CONNECTION=mysql\nDB_HOST=127.0.0.1\nDB_PORT=3306\nDB_DATABASE=laravel_api\nDB_USERNAME=root\nDB_PASSWORD=\n\nCACHE_DRIVER=redis\nQUEUE_CONNECTION=redis\nSESSION_DRIVER=file`
            },
            {
                id: 'composer.json',
                name: 'composer.json',
                type: 'file',
                language: 'json',
                content: `{\n    "name": "laravel/laravel",\n    "type": "project",\n    "description": "The Laravel Framework.",\n    "require": {\n        "php": "^8.2",\n        "guzzlehttp/guzzle": "^7.2",\n        "laravel/framework": "^10.0",\n        "laravel/sanctum": "^3.2",\n        "laravel/tinker": "^2.8"\n    },\n    "require-dev": {\n        "fakerphp/faker": "^1.9.1",\n        "laravel/pint": "^1.0",\n        "laravel/sail": "^1.18",\n        "mockery/mockery": "^1.4.4",\n        "nunomaduro/collision": "^7.0",\n        "phpunit/phpunit": "^10.0",\n        "spatie/laravel-ignition": "^2.0"\n    }\n}`
            }
        ]
    }
];